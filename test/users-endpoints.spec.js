/* eslint-disable no-undef */
const supertest = require('supertest');
const app = require('../src/app');
const { TEST_ATLAS_URI_users } = process.env;
const mongoose = require('mongoose');
const { seedTestTables } = require('./Fixtures/seedTestTables');
const Content = require('./Fixtures/dbcontent.fixtures');
const Actions = require('./Fixtures/action.fixtures');

describe('/users endpoints', () => {
  before('connect to db', () => {
    mongoose.connect(TEST_ATLAS_URI_users, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
    const { connection } = mongoose;
    connection.once('open', () => {
      console.log('MongoDB database connected successfully');
    });
  });

  before('seed tables', () => seedTestTables(TEST_ATLAS_URI_users));

  after('disconnect from db', () => mongoose.connection.close());

  const testUsers = Content.makeUsersArr();

  describe('GET /users', () => {

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get('/api/users')
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if user is not admin/provider', () => {
        return supertest(app)
          .get('/api/users')
          .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
          .expect(401);
      });

      it('returns 200 and all users if user is admin', () => {
        before('seed tables', () => seedTestTables(TEST_ATLAS_URI_users));

        return supertest(app)
          .get('/api/users')
          .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.eql(testUsers.length);
          });
      });
    });
  });

  describe('GET /users/:user_id', () => {
    const user = testUsers[2];

    context('Given no user is logged in', () => {
      before('seed tables', () => seedTestTables(TEST_ATLAS_URI_users));
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get(`/api/users/${user._id}`)
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if admin is not logged in', () => {
        return supertest(app)
          .get(`/api/users/${user._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .expect(401);
      });

      it('returns user if admin is logged in', () => {
        return supertest(app)
          .get(`/api/users/${user._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('object');
            expect(res.body._id).to.eql(user._id);
            expect(res.body.user_name).to.eql(user.user_name);
          });
      });
    });
  });

  describe('PATCH /users/:id', () => {
    const data = { user_name : 'ANEWUSERNAME' };

    it('responds 201 and updates existing user', () => {
      const toUpdate = testUsers[3];

      return supertest(app)
        .patch(`/api/users/${toUpdate._id}`)
        .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
        .send(data)
        .expect(201)
        .then(() => {
          return supertest(app)
            .get(`/api/users/${toUpdate._id}`)
            .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
            .expect(200)
            .then(res => {
              expect(res.body.user_name).to.eql(data.user_name);
            });
        });
    });
  });

  describe('DELETE /users', () => {

    it('responds 204 and deletes user from system', () => {
      before('seed tables', () => seedTestTables(TEST_ATLAS_URI_users));
      const toDelete = testUsers[3];

      return supertest(app)
        .delete(`/api/users/${toDelete._id}`)
        .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
        .expect(204)
        .then(() => {
          const validUserCreds = {
            user_name: toDelete.user_name,
            password: toDelete.password
          };
      
          return supertest(app)
            .post('/api/auth/login')
            .send(validUserCreds)
            .expect(400);
        });
    });
  });
});