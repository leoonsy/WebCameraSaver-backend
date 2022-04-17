import express from 'express';
import createError from 'http-errors';
import path from 'path';
import logger from 'morgan';
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

// catch 404
app.use((req, res, next) => {
  next(createError(404));
});

export default app;
