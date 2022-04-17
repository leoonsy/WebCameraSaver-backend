import app from './app';

const server = app.listen(app.get('PORT'), () => {
  console.log(
    'App is running at http://localhost:%d',
    app.get('PORT'),
  );
});

export default server;
