const request = require('supertest');

jest.mock('../models/User', () => {
  const users = new Map();
  let idCounter = 1;

  return {
    create: async (data) => {
      const id = (idCounter++).toString();
      const user = { _id: id, ...data };
      users.set(id, user);
      return user;
    },
    findById: (id) => ({
      select: async () => {
        const u = users.get(id);
        if (!u) return null;
        const copy = { ...u };
        delete copy.password;
        return copy;
      },
    }),
    deleteOne: async ({ _id }) => {
      users.delete(_id);
      return { deletedCount: 1 };
    },
    __reset: () => {
      users.clear();
      idCounter = 1;
    },
  };
});

// Ensure JWT_SECRET available for generateToken
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const app = require('./utils/testApp');

describe('Auth middleware and token handling', () => {
  beforeEach(() => {
    if (typeof User.__reset === 'function') User.__reset();
  });

  test('Request without token -> 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  test('Request with invalid token -> 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token failed|not authorized/i);
  });

  test('Request with valid token -> attaches correct user to req.user', async () => {
    const user = await User.create({ name: 'T1', email: 't1@test.com', password: 'Pass123!', role: 'owner' });
    const token = generateToken(user);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe(user._id.toString());
    // Ensure password is not returned
    expect(res.body.user.password).toBeUndefined();
  });

  test('User not found in DB -> 401', async () => {
    const user = await User.create({ name: 'T2', email: 't2@test.com', password: 'Pass123!', role: 'owner' });
    const token = generateToken(user);
    // remove user
    await User.deleteOne({ _id: user._id });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/user not found|not authorized/i);
  });

  test('Malformed Authorization header -> 401', async () => {
    const user = await User.create({ name: 'T3', email: 't3@test.com', password: 'Pass123!', role: 'owner' });
    const token = generateToken(user);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Token ${token}`); // malformed

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });
});
