import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ChatSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IChat>('Chat', ChatSchema);
