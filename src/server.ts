import errorHandler from 'errorhandler';
import app from './app';

if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

const server = app.listen(app.get('PORT'), () => {
  console.log(
    'App is running at http://localhost:%d',
    app.get('PORT'),
  );
});

export default server;
