/* eslint-disable no-undef */
const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const Fixtures = require("./fixtures/action.fixtures");

describe('/users endpoints', () => {
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

  describe("GET /users", () => {

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get(`/api/users`)
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if user is not admin/provider', () => {
        return supertest(app)
          .get(`/api/users`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
          .expect(401);
      });

      it('returns 200 and all users if user is admin', () => {
        return supertest(app)
          .get(`/api/users`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.eql(testUsers.length);
          });
      });
    });
  });

  describe("GET /users/:user_id", () => {
    const user = testUsers[2];

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get(`/api/users/${user.id}`)
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if admin is not logged in', () => {
        return supertest(app)
          .get(`/api/users/${user.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(401);
      });

      it('returns user if admin is logged in', () => {
        return supertest(app)
          .get(`/api/users/${user.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('object');
            expect(res.body.id).to.eql(user.id);
            expect(res.body.user_name).to.eql(user.user_name);
          });
      });
    });
  });

  describe('PATCH /users/:id', () => {
    const data = { user_name : 'ANEWUSERNAME' };

    it('refuses to update demo users (id of 1, 2, 3, 4, 5)', () => {
      return supertest(app)
        .patch(`/api/users/${testUsers[0].id}`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
        .send(data)
        .expect(400);
    });


    it('responds 201 and updates existing user', () => {
      const toUpdate = Fixtures.makeNewUser();

      return supertest(app)
        .post('/api/auth/register')
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
        .send(toUpdate)
        .expect(201)
        .then(() => {
          return supertest(app)
            .patch(`/api/users/${toUpdate.id}`)
            .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
            .send(data)
            .expect(201)
            .then(() => {
              return supertest(app)
                .get(`/api/users/${toUpdate.id}`)
                .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
                .expect(200)
                .then(res => {
                  expect(res.body.user_name).to.eql(data.user_name);
                });
            });
        });
    });
  });

  describe('DELETE /users', () => {

    it('refuses to delete demo users (id of 1, 2, 3, 4, 5)', () => {
  
      return supertest(app)
        .delete(`/api/users/${testUsers[0].id}`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
        .expect(400)
        .then(() => {
          const validUserCreds = {
            user_name: testUsers[0].user_name,
            password: testUsers[0].password
          };
      
          return supertest(app)
            .post('/api/auth/login')
            .send(validUserCreds)
            .expect(200);
        });
    });


    it('responds 204 and deletes user from system', () => {
      const toDelete = Fixtures.makeNewUser();

      return supertest(app)
        .post('/api/auth/register')
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
        .send(toDelete)
        .expect(201)
        .then(() => {
          return supertest(app)
            .delete(`/api/users/${toDelete.id}`)
            .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
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
});