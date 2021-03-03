/* eslint-disable no-undef */
const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const Fixtures = require("./fixtures/action.fixtures");

describe('/client-mgmt endpoints', () => {
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

  beforeEach("insert stuff", () => {
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

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => Fixtures.cleanTables(db));

  afterEach('cleanup', () => Fixtures.cleanTables(db));

  // FOR USER EXERCISE MANAGEMENT BY ADMIN/PROVIDER

  describe("GET client-mgmt/exercises/:id", () => {
    const user_ex = testUserExercises[0];

    it('returns 401 unauthorized when not logged in', () => {
      return supertest(app)
        .get(`/api/client-mgmt/exercises/${user_ex.id}`)
        .expect(401);
    });

    it('returns 404 not found if exercise does not exist', () => {
      return supertest(app)
        .get(`/api/client-mgmt/exercises/0000`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
        .expect(404);
    });
    
    it('returns user exercise when provider/admin', () => {
      return supertest(app)
        .get(`/api/client-mgmt/exercises/${user_ex.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
        .expect(200)
        .then(res => {
          expect(res.body).to.have.property('frequency');
          expect(res.body).to.have.property('videourl');
        });
    });
  });

  describe("POST /client-mgmt/exercises/:user_id", () => {
    const newEx = Fixtures.makeNewUserExercise();

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
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
          .send(newEx)
          .expect(401);
      });

      it('returns 201 and adds client exercise if user is admin/provider', () => {
        return supertest(app)
          .post(`/api/client-mgmt/exercises/${newEx.user_id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .send(newEx)
          .expect(201)
          .then(res => {
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('id');
            expect(res.body.user_id).to.eql(newEx.user_id);
            expect(parseInt(res.body.frequency)).to.eql(newEx.frequency);
          });
      });
    });
  });

  describe("PATCH /client-mgmt/exercises/:user_ex_id", () => {
    const newData = { duration : 'NEWDURATION' };
    const toEdit = testUserExercises[0];

    it('returns 404 not found if exercise does not exist', () => {
      return supertest(app)
        .patch(`/api/client-mgmt/exercises/0000`)
        .send(newData)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
        .expect(404);
    });

    it('returns 401 unauthorized if not admin/provider', () => {
      return supertest(app)
        .patch(`/api/client-mgmt/exercises/${toEdit.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
        .send(newData)
        .expect(401);
    });
    
    it('returns 201 and edits user exercise if user is admin/provider', () => {
      return supertest(app)
        .patch(`/api/client-mgmt/exercises/${toEdit.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
        .send(newData)
        .expect(201)
        .then(res => {
          expect(res.body.exercise_name).to.eql(newData.exercise_name);
        });
    });
  });

  describe("DELETE /client-mgmt/exercises/:user_ex_id", () => {
    const toDelete = testUserExercises[0];

    it('returns 404 not found if exercise does not exist', () => {
      return supertest(app)
        .delete(`/api/client-mgmt/exercises/00000`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
        .expect(404);
    });

    it('returns 401 unauthorized if not admin/provider', () => {
      return supertest(app)
        .delete(`/api/client-mgmt/exercises/${toDelete.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
        .expect(401);
    });
    
    it('returns 204 and deletes user exercise if user is admin/provider', () => {
      return supertest(app)
        .delete(`/api/client-mgmt/exercises/${toDelete.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
        .expect(204)
        .then(() => {
          return supertest(app)
            .delete(`/api/client-mgmt/exercises/${toDelete.id}`)
            .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
            .expect(404);
        });
    });
  });

  // FOR USER GOAL MANAGEMENT
  describe("POST /client-mgmt/goal", () => {
    const newGoal = Fixtures.makeNewUserGoal();

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .post(`/api/client-mgmt/goal`)
          .send(newGoal)
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if user is not admin/provider', () => {
        return supertest(app)
          .post(`/api/client-mgmt/goal`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
          .send(newGoal)
          .expect(401);
      });

      it('returns 400 if user is admin/provider and client already has goal', () => {
        return supertest(app)
          .post(`/api/client-mgmt/goal`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .send(newGoal)
          .expect(400);
      });

      it('returns 201 and adds client goal if user is admin/provider and user does not have goal', () => {
        newGoal.user_id = 6;
        const toAddGoal = Fixtures.makeNewUser();

        return supertest(app)
          .post('/api/auth/register')
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
          .send(toAddGoal)
          .expect(201)
          .then(() => {
            return supertest(app)
              .post(`/api/client-mgmt/goal`)
              .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
              .send(newGoal)
              .expect(201)
              .then(res => {
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('id');
                expect(res.body.user_id).to.eql(newGoal.user_id);
                expect(res.body.goal_text).to.eql(newGoal.goal_text);
              });
          });
      });
    });
  });

  describe("PATCH /client-mgmt/goal/:user_id", () => {
    const newData = { goal_text : 'NEWGOALTEXT' };

    it('returns 404 not found if exercise does not exist', () => {
      return supertest(app)
        .patch(`/api/client-mgmt/goal/0000`)
        .send(newData)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
        .expect(404);
    });

    it('returns 401 unauthorized if not admin/provider', () => {
      return supertest(app)
        .patch(`/api/client-mgmt/goal/${testUsers[0].id }`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
        .send(newData)
        .expect(401);
    });
    
    it('returns 201 and edits user goal if user is admin/provider', () => {
      return supertest(app)
        .patch(`/api/client-mgmt/goal/${testUsers[1].id}`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
        .send(newData)
        .expect(201)
        .then(res => {
          expect(res.body.goal_text).to.eql(newData.goal_text);
          expect(res.body.user_id).to.eql(testUsers[1].id);
        });
    });
  });
});