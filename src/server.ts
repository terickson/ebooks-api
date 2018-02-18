import { properties } from './utils/properties';
import {logger} from './utils/logger';

// load all models and creates DB connection
import { sequelize } from './models/index';

// create express server
import { app } from './routes/index';

sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connected');

    const server = app.listen(properties.server.port);
    server.on('listening', () => {
      logger.info(`Listening on port ${properties.server.port}.`);
    })
    server.on('error', (e) => {
      logger.error(`Error starting server: ${e.message}`);
      server.close(() => {
        process.exit(1)
      })
    })
  })
  .catch((e) => {
    logger.error(`Error connecting to database: ${e.message}`)
    process.exit(1)
  })
