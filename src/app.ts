import express from 'express';
import path from 'path';
import logger from 'morgan';
import fs from 'fs';
import userRouter from './routes/user';
import videoRouter from './routes/video';
import './db/db';

const app = express();
app.set('PORT', process.env.PORT || 3000);

const API_V1_PATH = '/api/v1';

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(API_V1_PATH, userRouter);
app.use(API_V1_PATH, videoRouter);

app.get('/*', (req, res) => {
  const dir = path.join(__dirname, '/public/index.html');
  if (!fs.existsSync(dir)) {
    res.status(404).send();
    return;
  }

  res.sendFile(dir, (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

export default app;
