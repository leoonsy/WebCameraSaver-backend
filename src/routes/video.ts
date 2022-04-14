import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { HydratedDocument } from 'mongoose';
import path from 'path';
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
    if (!file || !/^[a-zA-Zа-яА-Яё0-9-]+$/.test(file.originalname)) {
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

router.get('/video', auth, async (req, res) => {
  try {
    const user = res.locals.user as HydratedDocument<UserType>;
    const dir = `${__dirname}/../db/video/${user.login}`;

    if (!fs.existsSync(dir)) {
      res.json([]);
      return;
    }

    fs.readdir(dir, (err, files) => {
      if (err) {
        res.status(500).send();
        return;
      }

      const result = files.reduce((acc, file) => {
        const stats = fs.statSync(`${dir}/${file}`);
        acc.push({
          name: path.parse(file).name,
          size: stats.size,
        });
        return acc;
      }, [] as { name: string; size: number; }[]);

      res.json(result);
    });
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/video/:name', auth, async (req, res) => {
  try {
    const user = res.locals.user as HydratedDocument<UserType>;
    const dir = `${__dirname}/../db/video/${user.login}`;
    const { name } = req.params;

    if (!name || !/^[a-zA-Zа-яА-Яё0-9-]+$/.test(name)) {
      res.status(400).send();
      return;
    }
    res.download(`${dir}/${name}.webm`);
  } catch (error) {
    res.status(500).send();
  }
});

export default router;
