const app = require('./app');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception, shutting down:', err);
  process.exit(1);
});
function startServer(port) {

  try {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      server.close(() => {
        console.log('Process terminated, server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      server.close(() => {
        console.log('Process interrupted, server closed');
        process.exit(0);
      });
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception, shutting down:', err);
      server.close(() => {
        process.exit(1);
      });
    });


  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
startServer(process.env.PORT || 3000);