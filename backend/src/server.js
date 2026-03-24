const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');

dotenv.config();

const { initSocket } = require('./socket/socket');

// Connect to Database
connectDB();

const { server, io } = initSocket(app);

// Make io accessible in controllers via req.app.set
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
