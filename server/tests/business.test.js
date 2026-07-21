const request = require('supertest');

jest.mock('../models/User', () => {
  const users = new Map();
  let userId = 1;
  return {
    create: async (data) => {
      const id = (userId++).toString();
      const user = { _id: id, isAdmin: false, ...data };
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
    __reset: () => {
      users.clear();
      userId = 1;
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
        save: async function save() {
          businesses.set(id, this);
          return this;
        },
      };
    },
    findOne: async ({ ownerId }) => {
      for (const business of businesses.values()) {
        if (business.ownerId === ownerId) return business;
      }
      return null;
    },
    __reset: () => {
      businesses.clear();
      businessId = 1;
    },
  };
});

// Ensure JWT_SECRET available for generateToken
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const User = require('../models/User');
const Business = require('../models/Business');
const generateToken = require('../utils/generateToken');
const app = require('./utils/testApp');

describe('Business routes and role-based access', () => {
  beforeEach(() => {
    if (typeof User.__reset === 'function') User.__reset();
    if (typeof Business.__reset === 'function') Business.__reset();
  });

  test('Normal user cannot access business open route -> 403 (Not your business)', async () => {
    const owner = await User.create({ name: 'Owner', email: 'owner@test.com', password: 'Pass123!', role: 'owner' });
    const normal = await User.create({ name: 'Normal', email: 'normal@test.com', password: 'Pass123!', role: 'customer' });

    const business = await Business.create({ name: 'B1', code: 'B1', ownerId: owner._id, isApproved: true });

    const token = generateToken(normal);

    const res = await request(app)
      .patch(`/api/business/${business._id}/open`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not your business/i);
  });

  test('Owner can only retrieve their own business', async () => {
    const firstOwner = await User.create({ name: 'First owner', email: 'first@test.com', password: 'Pass123!', role: 'owner' });
    const secondOwner = await User.create({ name: 'Second owner', email: 'second@test.com', password: 'Pass123!', role: 'owner' });
    await Business.create({ name: 'First business', code: 'FIRST', ownerId: firstOwner._id, isApproved: true });
    const secondBusiness = await Business.create({ name: 'Second business', code: 'SECOND', ownerId: secondOwner._id, isApproved: false });

    const res = await request(app)
      .get('/api/business/my-business')
      .set('Authorization', `Bearer ${generateToken(secondOwner)}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(secondBusiness._id);
  });

  test('Owner without a business receives a 404 from my-business', async () => {
    const owner = await User.create({ name: 'New owner', email: 'new@test.com', password: 'Pass123!', role: 'owner' });

    const res = await request(app)
      .get('/api/business/my-business')
      .set('Authorization', `Bearer ${generateToken(owner)}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('No business found');
  });

  test('Business owner can open queue if approved -> 200', async () => {
    const owner = await User.create({ name: 'Owner2', email: 'owner2@test.com', password: 'Pass123!', role: 'owner' });

    const business = await Business.create({ name: 'B2', code: 'B2', ownerId: owner._id, isApproved: true });

    const token = generateToken(owner);

    const res = await request(app)
      .patch(`/api/business/${business._id}/open`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.business.queueOpen).toBe(true);
  });

  test('Business owner cannot open queue if not approved -> 400', async () => {
    const owner = await User.create({ name: 'Owner3', email: 'owner3@test.com', password: 'Pass123!', role: 'owner' });

    const business = await Business.create({ name: 'B3', code: 'B3', ownerId: owner._id, isApproved: false });

    const token = generateToken(owner);

    const res = await request(app)
      .patch(`/api/business/${business._id}/open`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not approved/i);
  });

  test('Admin user can approve a business -> 200', async () => {
    const owner = await User.create({ name: 'Owner4', email: 'owner4@test.com', password: 'Pass123!', role: 'owner' });
    const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Pass123!', role: 'owner', isAdmin: true });

    const business = await Business.create({ name: 'B4', code: 'B4', ownerId: owner._id, isApproved: false });

    const token = generateToken(admin);

    const res = await request(app)
      .patch(`/api/business/${business._id}/approve`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.business.isApproved).toBe(true);
  });
});
