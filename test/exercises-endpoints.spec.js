/* eslint-disable no-undef */
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const { TEST_ATLAS_URI } = process.env;
const mongoose = require('mongoose');
const { seedTestTables } = require('./Fixtures/seedTestTables');
const Content = require('./Fixtures/dbcontent.fixtures');
const Actions = require('./Fixtures/action.fixtures');

describe('/exercises endpoints', () => {
  
  before('connect to db', () => {
    mongoose.connect(TEST_ATLAS_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
    const { connection } = mongoose;
    connection.once('open', () => {
      console.log('MongoDB database connected successfully');
    });
  });

  after('disconnect from db', () => mongoose.connection.close());

  describe('GET /exercises', () => {

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get('/api/exercises')
          .expect(401);
      });
    });

    context('Given user is logged in & there are exercises', () => {
      const testExercises = Content.makeExercisesArr();
      const testUsers = Content.makeUsersArr();

      it('returns 200 and all base exercises with categories arrays if user is admin/provider', () => {
        before('seed tables', () => seedTestTables());

        return supertest(app)
          .get('/api/exercises')
          .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.eql(testExercises.length);
          });
      });

      it('returns 200 and all USER exercises if user is not admin/provider', () => {
        return supertest(app)
          .get('/api/exercises')
          .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('exercises');
            expect(res.body).to.have.property('goal');
            expect(res.body.goal).to.eql(testUsers[1].user_goal);
            res.body.exercises.forEach(exc => {
              expect(exc.user_id).to.eql(testUsers[1]._id);
              expect(exc).to.have.property('frequency');
              expect(exc).to.have.property('duration');
              expect(exc).to.have.property('exercise_name');
            });
          });
      });
    });
  });

  describe('POST /exercises', () => {
    before('seed tables', () => seedTestTables());
    const testUsers = Content.makeUsersArr();
    let newExercise = Actions.makeNewExercise();

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .post('/api/exercises')
          .send(newExercise)
          .expect(401);
      });
    });

    context('Given user is NOT a provider/admin', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .post('/api/exercises')
          .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
          .send(newExercise)
          .expect(401);
      });
    });

    context('Given user is a provider/admin', () => {
      Object.keys(newExercise).forEach(el => {
        const badExercise = Actions.makeNewExercise();

        it(`returns 400 and states required fields when missing ${el}`, () => { 
          delete badExercise[el];
          return supertest(app)
            .post('/api/exercises')
            .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
            .send(badExercise)
            .expect(400);
        });
      });

      it('Creates new exercise when body is correct', () => {
        return supertest(app)
          .post('/api/exercises')
          .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
          .send(newExercise)
          .expect(201)
          .then(res => {
            expect(res.body.exercise_name).to.eql(newExercise.exercise_name);
            expect(res.body.imgurl).to.eql(newExercise.imgurl);
            expect(res.body.videourl).to.eql(newExercise.videourl);
            expect(res.body).to.have.property('_id');
          }).then(() => {
            return supertest(app)
              .get('/api/exercises')
              .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
              .expect(200)
              .then(res => {
                expect(res.body[res.body.length - 1].exercise_name).to.eql(newExercise.exercise_name);
              });
          });
      });
    });
  });

  describe('/exercises/:id endpoint', () => {
    const testExercises = Content.makeExercisesArr();
    const testUserExercises = Content.makeUserExercisesArr();
    const testUsers = Content.makeUsersArr();
    const ex = testExercises[0];
    const user_ex = testUserExercises[0];
   
    describe('GET /exercises/:id', () => {
      it('returns 401 unauthorized when not logged in', () => {
        before('seed tables', () => seedTestTables());

        return supertest(app)
          .get(`/api/exercises/${ex.id}`)
          .expect(401);
      });

      it('returns 404 not found if exercise does not exist', () => {
        return supertest(app)
          .get('/api/exercises/0000')
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .expect(404);
      });
      
      it('returns base exercise when user is provider/admin', () => {
        return supertest(app)
          .get(`/api/exercises/${ex._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .expect(200)
          .then(res => {
            expect(res.body).to.not.have.property('frequency');
          });
      });
      
      it('returns specific user exercise when not provider/admin', () => {
        return supertest(app)
          .get(`/api/exercises/${user_ex.exercise}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
          .expect(200)
          .then(res => {
            expect(res.body).to.have.property('frequency');
            expect(res.body).to.have.property('videourl');
          });
      });
    });

    describe('PATCH /exercises/:id', () => {
      const newData = { exercise_name : 'NEW NAME' };

      it('returns 404 not found if exercise does not exist', () => {
        before('seed tables', () => seedTestTables());
        return supertest(app)
          .patch('/api/exercises/0000')
          .send(newData)
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .expect(404);
      });

      it('returns 401 unauthorized if not admin/provider', () => {
        return supertest(app)
          .patch(`/api/exercises/${ex._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
          .send(newData)
          .expect(401);
      });
      
      it('returns 201 and edits exercise if user is admin/provider', () => {
        return supertest(app)
          .patch(`/api/exercises/${ex._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .send(newData)
          .expect(201)
          .then(res => {
            expect(res.body.exercise_name).to.eql(newData.exercise_name);
          });
      });
    });
  
    describe('DELETE /exercises/:id', () => {
      it('returns 404 not found if exercise does not exist', () => {
        return supertest(app)
          .delete('/api/exercises/0000')
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .expect(404);
      });

      it('returns 401 unauthorized if not admin/provider', () => {
        return supertest(app)
          .delete(`/api/exercises/${ex._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[1]))
          .expect(401);
      });
      
      it('returns 204 and deletes exercise if user is admin/provider', () => {
        return supertest(app)
          .delete(`/api/exercises/${ex._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
          .expect(204)
          .then(() => {
            return supertest(app).delete(`/api/exercises/${ex._id}`)
              .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
              .expect(404);
          });
      });
    });
  });
});