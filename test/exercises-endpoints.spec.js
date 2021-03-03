/* eslint-disable no-undef */
const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const Fixtures = require('./fixtures/action.fixtures');

describe('/exercises endpoints', () => {
  let db;

  const {
    testUsers,
    testExercises,
    testUserExercises,
    testComments,
    testCats,
    testExerciseCats,
    testUserGoals
  } = Fixtures.makeFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => Fixtures.cleanTables(db));

  afterEach('cleanup', () => Fixtures.cleanTables(db));

  describe('GET /exercises', () => {

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get('/api/exercises')
          .expect(401);
      });
    });

    context('Given user is logged in & there are no exercises', () => {
      before('insert users', () => {
        return Fixtures.seedTables(
          db,
          testUsers
        );});

      it('returns 200 and an empty array', () => {
        return supertest(app)
          .get('/api/exercises')
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(200, []);
      });
    });

    context('Given user is logged in & there are exercises', () => {
      beforeEach('insert stuff', () => {
        return Fixtures.seedTables(
          db,
          testUsers,
          testExercises,
          testUserExercises,
          testComments,
          testUserGoals,
          testCats,
          testExerciseCats
        );
      });

      it.only('returns 200 and all base exercises with categories arrays if user is admin/provider', () => {
        return supertest(app)
          .get('/api/exercises')
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(200)
          // .then(res => {
          //   expect(res.body).to.be.an('array');
          //   expect(res.body[0]).to.have.property('body_part');
          //   expect(res.body.length).to.eql(testExercises.length);
          // });
      });

      it('returns 200 and all USER exercises if user is not admin/provider', () => {
        return supertest(app)
          .get('/api/exercises')
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('exercises');
            expect(res.body).to.have.property('goal');
            expect(res.body.goal.user_id).to.eql(testUsers[1].id);
            res.body.exercises.forEach(exc => {
              expect(exc.user_id).to.eql(testUsers[1].id);
              expect(exc).to.have.property('frequency');
              expect(exc).to.have.property('duration');
              expect(exc).to.have.property('exercise_name');
            });
          });
      });
    });
  });

  describe('POST /exercises', () => {
    beforeEach('insert users', () => {
      return Fixtures.seedTables(
        db,
        testUsers
      );
    });

    let newExercise = Fixtures.makeNewExercise();

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
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
          .send(newExercise)
          .expect(401);
      });
    });

    context('Given user is a provider/admin', () => {
      Object.keys(newExercise).forEach(el => {
        const badExercise = Fixtures.makeNewExercise();

        it(`returns 400 and states required fields when missing ${el}`, () => { 
          delete badExercise[el];
          return supertest(app)
            .post('/api/exercises')
            .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
            .send(badExercise)
            .expect(400);
        });
      });

      it('Creates new exercise when body is correct', () => {
        return supertest(app)
          .post('/api/exercises')
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
          .send(newExercise)
          .expect(201)
          .then(res => {
            expect(res.body.exercise_name).to.eql(newExercise.exercise_name);
            expect(res.body.imgurl).to.eql(newExercise.imgurl);
            expect(res.body.videourl).to.eql(newExercise.videourl);
            expect(res.body).to.have.property('id');
          }).then(() => {
            return supertest(app)
              .get('/api/exercises')
              .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
              .expect(200)
              .then(res => {
                expect(res.body[res.body.length - 1].exercise_name).to.eql(newExercise.exercise_name);
              });
          });
      });
    });
  });

  describe('/exercises/:id endpoint', () => {
    beforeEach('insert stuff', () => {
      return Fixtures.seedTables(
        db,
        testUsers,
        testExercises,
        testUserExercises,
        testComments,
        testUserGoals,
        testCats,
        testExerciseCats
      );
    });

    const ex = testExercises[0];
    const user_ex = testUserExercises[0];
   
    describe('GET /exercises/:id', () => {
      it('returns 401 unauthorized when not logged in', () => {
        return supertest(app)
          .get(`/api/exercises/${ex.id}`)
          .expect(401);
      });

      it('returns 404 not found if exercise does not exist', () => {
        return supertest(app)
          .get('/api/exercises/0000')
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(404);
      });
      
      it('returns base exercise when user is provider/admin', () => {
        return supertest(app)
          .get(`/api/exercises/${ex.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(200)
          .then(res => {
            expect(res.body).to.not.have.property('frequency');
          });
      });
      
      it('returns specific user exercise when not provider/admin', () => {
        return supertest(app)
          .get(`/api/exercises/${user_ex.exercise_id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
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
        return supertest(app)
          .patch('/api/exercises/0000')
          .send(newData)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(404);
      });

      it('returns 401 unauthorized if not admin/provider', () => {
        return supertest(app)
          .patch(`/api/exercises/${ex.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
          .send(newData)
          .expect(401);
      });
      
      it('returns 201 and edits exercise if user is admin/provider', () => {
        return supertest(app)
          .patch(`/api/exercises/${ex.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
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
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(404);
      });

      it('returns 401 unauthorized if not admin/provider', () => {
        return supertest(app)
          .delete(`/api/exercises/${ex.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
          .expect(401);
      });
      
      it('returns 204 and deletes exercise if user is admin/provider', () => {
        return supertest(app)
          .delete(`/api/exercises/${ex.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(204)
          .then(() => {
            return supertest(app).delete(`/api/exercises/${ex.id}`)
              .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
              .expect(404);
          });
      });
    });
  });
});