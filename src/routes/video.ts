import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { HydratedDocument } from 'mongoose';
import path from 'path';
import auth from '../middleware/auth';
import { UserType } from '../models/User';

const upload = multer();

const router = Router();

const videoDir = path.join(__dirname, '/../db/video');
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir);
}

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

    const dir = path.join(videoDir, user.login);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    await fs.writeFile(
      path.join(dir, '/', `${file.originalname}.webm`),
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
    const dir = path.join(videoDir, user.login);

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
        const stats = fs.statSync(path.join(dir, '/', file));
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
    const dir = path.join(videoDir, user.login);
    const { name } = req.params;
    if (!name || !/^[a-zA-Zа-яА-Яё0-9-]+$/.test(name)) {
      res.status(400).send();
      return;
    }
    res.download(path.join(dir, '/', `${name}.webm`));
  } catch (error) {
    res.status(500).send();
  }
});

router.delete('/video/:name', auth, async (req, res) => {
  try {
    const user = res.locals.user as HydratedDocument<UserType>;
    const dir = path.join(videoDir, user.login);
    const { name } = req.params;

    if (!name || !/^[a-zA-Zа-яА-Яё0-9-]+$/.test(name)) {
      res.status(400).send();
      return;
    }

    fs.unlink(path.join(dir, '/', `${name}.webm`), () => {
      res.status(200).send();
    });
    res.download(path.join(dir, '/', `${name}.webm`));
  } catch (error) {
    res.status(500).send();
  }
});

export default router;
