import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import User, { TokenPayload } from '../models/User';

const auth: RequestHandler = async (req, res, next) => {
  const sendError = () => {
    res.status(401).json({ error: 'Not authorized' });
  };

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    sendError();
    return;
  }

  try {
    const data = jwt.verify(token, process.env.JWT_KEY as string) as TokenPayload;
    const user = await User.findOne({ id: data.id, 'tokens.token': token });
    if (!user) {
      sendError();
      return;
    }

    res.locals.user = user;
    res.locals.token = token;
    next();
  } catch (error) {
    sendError();
  }
};

export default auth;
