/* eslint-disable no-undef */
const supertest = require('supertest');
const app = require('../src/app');
const { TEST_ATLAS_URI_clients_clientmgmt } = process.env;
const mongoose = require('mongoose');
const { seedTestTables } = require('./Fixtures/seedTestTables');
const Content = require('./Fixtures/dbcontent.fixtures');
const Actions = require('./Fixtures/action.fixtures');

describe('/clients endpoints', () => {
  before('connect to db', () => {
    mongoose.connect(TEST_ATLAS_URI_clients_clientmgmt, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
    const { connection } = mongoose;
    connection.once('open', () => {
      console.log('MongoDB database connected successfully');
    });
  });

  after('disconnect from db', () => mongoose.connection.close());

  const testUsers = Content.makeUsersArr();
  let clientList = testUsers.filter(el => !el.is_admin && !el.is_provider);

  describe('GET /clients', () => {

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get('/api/clients')
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if user is not admin/provider', () => {
        before('seed tables', () => seedTestTables(TEST_ATLAS_URI_clients_clientmgmt));
        return supertest(app)
          .get('/api/clients')
          .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
          .expect(401);
      });

      it('returns 200 and all clients (not admin/provider) if user is admin/provider', () => {
        return supertest(app)
          .get('/api/clients')
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.eql(clientList.length);
          });
      });
    });
  });

  describe('GET /clients/:client_id', () => {
    const client = clientList[0];

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get(`/api/clients/${client._id}`)
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if user is not admin/provider', () => {
        return supertest(app)
          .get(`/api/clients/${client._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
          .expect(401);
      });

      it('returns client, client exercises, and client goal if user is admin/provider', () => {
        return supertest(app)
          .get(`/api/clients/${client._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('client');
            expect(res.body.client._id).to.eql(client._id);
            expect(res.body.client.goal).to.eql(client.goal);
            expect(res.body).to.have.property('clientExercises');
            expect(res.body.clientExercises[0].user_id).to.eql(client._id);
          });
      });
    });
  });
});