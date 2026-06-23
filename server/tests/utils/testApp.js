const express = require('express');

const authRoutes = require('../../routes/authRoutes');
const businessRoutes = require('../../routes/businessRoutes');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/business', businessRoutes);
  return app;
};

module.exports = createApp();
