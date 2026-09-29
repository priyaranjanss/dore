import { Router } from 'express';
import Chat from '../models/Chat';
import { getChats, getChat, deleteChat, getMessages, sendMessage } from '../controllers/chats';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getChats);
router.post('/', async (req: any, res: any) => {
  const user = req.user;
  const chat = await Chat.create({ userId: user._id, title: 'New Chat' });
  res.status(201).json(chat);
});
router.get('/:id', getChat);
router.delete('/:id', deleteChat);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;
