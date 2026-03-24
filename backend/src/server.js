const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./socket/socket');

const start = async () => {
  // DB must connect before server listens
  await connectDB();

  const { server, io } = initSocket(app);
  app.set('io', io);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start();
