const dotenv = require('dotenv');

dotenv.config();

const app = require('./App');
const connectDatabase = require('./config/Database');

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
