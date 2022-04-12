import { Router } from 'express';
import { HydratedDocument } from 'mongoose';
import User, { UserType } from '../models/User';
import HTTPError from '../errors/HTTPError';
import auth from '../middleware/auth';

const router = Router();

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(400).send();
    }
    const user = await User.register(login, password);
    const token = await user.generateAuthToken();
    res.status(201).json({ token });
  } catch (error) {
    const code = (error as HTTPError).code || 500;
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
    const code = (error as HTTPError).code || 500;
    res.status(code).send();
  }
});

// Sign out
router.post('/users/signOut', auth, async (req, res) => {
  try {
    const user = res.locals.user as HydratedDocument<UserType>;
    user.tokens = user.tokens.filter((token) => token.token !== res.locals.token);
    await user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

// Change password
router.put('/users/password', auth, async (req, res) => {
  try {
    const user = res.locals.user as HydratedDocument<UserType>;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).send();
    }

    if (!(await user.isEqualPassword(oldPassword))) {
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
