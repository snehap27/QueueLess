/*
  Tests for register, login, logout (if present), and admin-only protection
*/
const request = require('supertest');

// Mock User and Business models locally for this test file
jest.mock('../models/User', () => {
  const users = new Map();
  let idCounter = 1;
  return {
    create: async (data) => {
      const id = (idCounter++).toString();
      const user = { _id: id, ...data, isAdmin: !!data.isAdmin };
      // provide matchPassword for controllers that call it
      user.matchPassword = async function (candidate) {
        return candidate === data.password;
      };
      users.set(id, user);
      return user;
    },
    findOne: async ({ email }) => {
      for (const u of users.values()) if (u.email === email) return u;
      return null;
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

jest.mock('../models/Business', () => {
  const businesses = new Map();
  let businessId = 1;
  return {
    create: async (data) => {
      const id = (businessId++).toString();
      const biz = { _id: id, ...data };
      businesses.set(id, biz);
      return biz;
    },
    findById: async (id) => {
      const b = businesses.get(id);
      if (!b) return null;
      return {
        ...b,
        save: async function () {
          businesses.set(id, this);
          return this;
        },
      };
    },
    __reset: () => {
      businesses.clear();
      businessId = 1;
    },
  };
});

const app = require('./utils/testApp');
const User = require('../models/User');
const Business = require('../models/Business');
const { createUser, getTokenFor, resetAll } = require('./helpers');

describe('Register and Login endpoints', () => {
  beforeEach(() => {
    resetAll([User, Business]);
  });

  test('Register: success', async () => {
    const body = { name: 'R1', email: 'r1@test.local', password: 'Pass123!', role: 'customer' };
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(body.email.toLowerCase());
  });

  test('Register: duplicate user -> 400', async () => {
    const body = { name: 'R2', email: 'r2@test.local', password: 'Pass123!', role: 'customer' };
    await request(app).post('/api/auth/register').send(body);
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email is already registered/i);
  });

  test('Register: missing fields -> 400', async () => {
    const body = { name: 'R3', email: 'r3@test.local', password: 'Pass123!' };
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/all fields are required/i);
  });

  test('Login: success', async () => {
    const user = await createUser(User, { email: 'login1@test.local', password: 'Pass123!', role: 'customer' });
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Pass123!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(user.email);
  });

  test('Login: wrong password -> 401', async () => {
    const user = await createUser(User, { email: 'login2@test.local', password: 'Pass123!', role: 'customer' });
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test('Login: non-existent email -> 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nope@test.local', password: 'Pass123!' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test('Logout endpoint absent -> 404', async () => {
    const res = await request(app).post('/api/auth/logout').send();
    expect([404, 405, 501]).toContain(res.status);
  });
});

describe('Admin-only protection (approve route)', () => {
  beforeEach(() => {
    resetAll([User, Business]);
  });

  test('Non-admin cannot approve business -> 403', async () => {
    const owner = await createUser(User, { email: 'ownerX@test.local', role: 'owner' });
    const business = await Business.create({ name: 'BX', code: 'BX', ownerId: owner._id, isApproved: false });

    const normal = await createUser(User, { email: 'normalX@test.local', role: 'customer' });
    const token = getTokenFor(normal);

    const res = await request(app)
      .patch(`/api/business/${business._id}/approve`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/admin access only/i);
  });
});
