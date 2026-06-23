// Shared helpers for tests: token generation and test user creation
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const generateToken = require('../utils/generateToken');

const createUser = async (UserModel, opts = {}) => {
  const defaults = {
    name: 'Test User',
    email: `user${Date.now()}@test.local`,
    password: 'Pass123!',
    role: 'owner',
  };
  const user = await UserModel.create({ ...defaults, ...opts });
  return user;
};

const getTokenFor = (user) => generateToken(user);

const resetAll = (models = []) => {
  models.forEach((m) => {
    if (m && typeof m.__reset === 'function') m.__reset();
  });
};

module.exports = {
  createUser,
  getTokenFor,
  resetAll,
};
