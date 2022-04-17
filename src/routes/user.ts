import { Router } from 'express';
import { HydratedDocument } from 'mongoose';
import { HttpError } from 'http-errors';
import User, { UserType } from '../models/User';
import auth from '../middleware/auth';

const router = Router();

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { login, password } = req.body;
    const MIN_PASSWORD_LENGTH = 5;

    if (!login
        || !password
        || typeof login !== 'string'
        || typeof password !== 'string'
        || !/^[a-zA-Z0-9]+$/.test(login)
        || password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).send();
    }

    const user = await User.register(login, password);
    const token = await user.generateAuthToken();
    res.status(201).json({ token });
  } catch (error) {
    const code = (error as HttpError).status || 500;
    res.status(code).send();
  }
});

// Login a registered user
router.post('/users/signIn', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).send();
    }

    const user = await User.findByCredentials(login, password);
    const token = await user.generateAuthToken();
    res.json({ token });
  } catch (error) {
    const code = (error as HttpError).status || 500;
    res.status(code).send();
  }
});

// Change password
router.put('/users/password', auth, async (req, res) => {
  try {
    const user = res.locals.user as HydratedDocument<UserType>;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).send();
    }

    if (!(await user.isEqualPassword(currentPassword))) {
      res.status(404).send();
    }

    user.password = newPassword;
    await user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/users/me', auth, async (req, res) => {
  const { user } = res.locals;
  res.json({ login: user.login });
});

export default router;
