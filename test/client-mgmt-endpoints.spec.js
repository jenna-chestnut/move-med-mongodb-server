/* eslint-disable no-undef */
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const { TEST_ATLAS_URI_clients_clientmgmt } = process.env;
const mongoose = require('mongoose');
const { seedTestTables } = require('./Fixtures/seedTestTables');
const Content = require('./Fixtures/dbcontent.fixtures');
const Actions = require('./Fixtures/action.fixtures');

describe('/client-mgmt endpoints', () => {
  before('connect to db', () => {
    mongoose.connect(TEST_ATLAS_URI_clients_clientmgmt, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
    const { connection } = mongoose;
    connection.once('open', () => {
      console.log('MongoDB database connected successfully');
    });
  });

  before('seed tables', () => seedTestTables(TEST_ATLAS_URI_clients_clientmgmt));

  beforeEach(done => setTimeout(done, 500));

  after('disconnect from db', () => mongoose.connection.close());

  const testUserExercises = Content.makeUserExercisesArr();
  const testUsers = Content.makeUsersArr();

  // FOR USER EXERCISE MANAGEMENT BY ADMIN/PROVIDER

  describe('GET client-mgmt/exercises/:id', () => { 
    const user_ex = testUserExercises[0];

    it('returns 401 unauthorized when not logged in', () => {
      return supertest(app)
        .get(`/api/client-mgmt/exercises/${user_ex._id}`)
        .expect(401);
    });

    it('returns 404 not found if exercise does not exist', () => {

      return supertest(app)
        .get('/api/client-mgmt/exercises/0000')
        .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
        .expect(404);
    });
    
    it('returns user exercise when provider/admin', () => {
      return supertest(app)
        .get(`/api/client-mgmt/exercises/${user_ex._id}`)
        .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
        .expect(200)
        .then(res => {
          expect(res.body).to.have.property('frequency');
          expect(res.body).to.have.property('videourl');
        });
    });
  });

  describe('POST /client-mgmt/exercises/:user_id', () => {
    const newEx = Actions.makeNewUserExercise();

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .post(`/api/client-mgmt/exercises/${newEx.user_id}`)
          .send(newEx)
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if user is not admin/provider', () => {
        return supertest(app)
          .post(`/api/client-mgmt/exercises/${newEx.user_id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
          .send(newEx)
          .expect(401);
      });

      it('returns 201 and adds client exercise if user is admin/provider', () => {
        return supertest(app)
          .post(`/api/client-mgmt/exercises/${newEx.user_id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .send(newEx)
          .expect(201)
          .then(res => {
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id');
            expect(res.body.user_id).to.eql(newEx.user_id);
            expect(parseInt(res.body.frequency)).to.eql(newEx.frequency);
          });
      });
    });
  });

  describe('PATCH /client-mgmt/exercises/:user_ex_id', () => {
    const newData = { duration : 'NEWDURATION' };
    const toEdit = testUserExercises[0];

    it('returns 404 not found if exercise does not exist', () => {
      return supertest(app)
        .patch('/api/client-mgmt/exercises/0000')
        .send(newData)
        .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
        .expect(404);
    });

    it('returns 401 unauthorized if not admin/provider', () => {
      return supertest(app)
        .patch(`/api/client-mgmt/exercises/${toEdit._id}`)
        .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
        .send(newData)
        .expect(401);
    });
    
    it('returns 201 and edits user exercise if user is admin/provider', () => {
      return supertest(app)
        .patch(`/api/client-mgmt/exercises/${toEdit._id}`)
        .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
        .send(newData)
        .expect(201)
        .then(res => {
          expect(res.body.exercise_name).to.eql(newData.exercise_name);
        });
    });
  });

  describe('DELETE /client-mgmt/exercises/:user_ex_id', () => {
    const toDelete = testUserExercises[0];

    it('returns 404 not found if exercise does not exist', () => {
      return supertest(app)
        .delete('/api/client-mgmt/exercises/00000')
        .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
        .expect(404);
    });

    it('returns 401 unauthorized if not admin/provider', () => {
      return supertest(app)
        .delete(`/api/client-mgmt/exercises/${toDelete._id}`)
        .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
        .expect(401);
    });
    
    it('returns 204 and deletes user exercise if user is admin/provider', () => {
      return supertest(app)
        .delete(`/api/client-mgmt/exercises/${toDelete._id}`)
        .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
        .expect(204)
        .then(() => {
          return supertest(app)
            .delete(`/api/client-mgmt/exercises/${toDelete._id}`)
            .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
            .expect(404);
        });
    });
  });
});