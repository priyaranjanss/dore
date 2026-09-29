import { Response } from 'express';
import User, { IUser } from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      _id: req.user!._id,
      name: req.user!.name,
      email: req.user!.email,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
