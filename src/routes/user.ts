import { Router } from 'express';
import User from '../models/User';
import HTTPError from '../errors/HTTPError';
import auth from '../middleware/auth';

const router = Router();

// Create a new user
router.post('/users', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || password?.length < 5) {
      res.status(401).json({ error: 'Validation error' });
    }
    await User.register(login, password);
    res.status(201).send();
  } catch (error) {
    const code = (error as HTTPError).code || 500;
    res.status(code).json({ error: (error as Error).message });
  }
});

// Login a registered user
router.post('/users/auth', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      res.status(401).json({ error: 'Validation error' });
    }

    const user = await User.findByCredentials(login, password);
    const token = await user.generateAuthToken();
    res.json({ login: user.login, token });
  } catch (error) {
    const code = (error as HTTPError).code || 500;
    res.status(code).json({ error: (error as Error).message });
  }
});

router.get('/users/me', auth, async (req, res) => {
  // View logged in user profile
  const { user } = res.locals;
  res.json({ login: user.login });
});

export default router;
