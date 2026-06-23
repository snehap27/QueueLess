const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // Ensure a JWT secret for tests
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};

const closeDatabase = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
};

module.exports = {
  connect,
  clearDatabase,
  closeDatabase,
};
