import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

MessageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
