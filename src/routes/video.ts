import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { HydratedDocument } from 'mongoose';
import auth from '../middleware/auth';
import { UserType } from '../models/User';

const upload = multer();

const router = Router();

// Save video
router.post('/video', auth, upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const user = res.locals.user as HydratedDocument<UserType>;

    // prevent attack
    if (!file || !/^[a-f0-9-]+$/.test(file.originalname)) {
      res.status(400).send();
      return;
    }

    const dir = `${__dirname}/../db/video/${user.login}`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    await fs.writeFile(
      `${dir}/${file.originalname}.webm`,
      file.buffer,
      (err) => {
        res.status(err ? 500 : 201).send();
      },
    );
  } catch (error) {
    res.status(500).send();
  }
});

export default router;
