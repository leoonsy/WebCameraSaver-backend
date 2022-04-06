import express from 'express';
import createError from 'http-errors';
import path from 'path';
import logger from 'morgan';
import userRouter from './routes/user';
import './db/db';

const app = express();
app.set('PORT', process.env.PORT || 3000);

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(userRouter);

// catch 404
app.use((req, res, next) => {
  next(createError(404));
});

export default app;
