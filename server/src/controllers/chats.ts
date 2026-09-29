import { Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { generateTitleFromMessage, streamAIResponse } from '../services/ai';
import { AuthRequest } from '../middleware/auth';

export const getChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({ userId: req.user!._id })
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt');

    res.json(chats);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }
    res.json(chat);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    await Message.deleteMany({ chatId: chat._id });
    await Chat.deleteOne({ _id: chat._id });

    res.json({ message: 'Chat deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    const messages = await Message.find({ chatId: chat._id })
      .sort({ createdAt: 1 })
      .select('_id role content createdAt');

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    if (typeof content !== 'string' || !content.trim()) {
      res.status(400).json({ message: 'Message content is required.' });
      return;
    }

    const chat = await Chat.findOne({ _id: id, userId: req.user!._id });
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    const userMessage = await Message.create({
      chatId: chat._id,
      role: 'user',
      content,
    });

    if (!chat.title || chat.title === 'New Chat') {
      chat.title = generateTitleFromMessage(content);
      await chat.save();
    }

    const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
    const conversationHistory = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let fullResponse = '';

    try {
      await streamAIResponse(conversationHistory, (chunk: string) => {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      });
    } catch (aiError: unknown) {
      const message = aiError instanceof Error ? aiError.message : 'AI service error';
      res.write(`data: ${JSON.stringify({ error: message, done: true })}\n\n`);
      res.end();
      return;
    }

    await Message.create({
      chatId: chat._id,
      role: 'assistant',
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: unknown) {
    console.error('Send message error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    if (!res.headersSent) {
      res.status(500).json({ message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message, done: true })}\n\n`);
      res.end();
    }
  }
};
