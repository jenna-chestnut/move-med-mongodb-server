/* eslint-disable no-undef */
const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const Fixtures = require("./fixtures/action.fixtures");

describe('/clients endpoints', () => {
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

  const clientList = testUsers.filter(el => !el.is_admin && !el.is_provider);

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

  describe("GET /clients", () => {

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get(`/api/clients`)
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if user is not admin/provider', () => {
        return supertest(app)
          .get(`/api/clients`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
          .expect(401);
      });

      it('returns 200 and all clients (not admin/provider) if user is admin/provider', () => {
        return supertest(app)
          .get(`/api/clients`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.eql(clientList.length);
          });
      });
    });
  });

  describe("GET /clients/:client_id", () => {
    const client = clientList[0];

    context('Given no user is logged in', () => {
      it('returns 401 unauthorized', () => {
        return supertest(app)
          .get(`/api/clients/${client.id}`)
          .expect(401);
      });
    });

    context('Given user is logged in', () => {
      it('returns 401 if user is not admin/provider', () => {
        return supertest(app)
          .get(`/api/clients/${client.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[1]))
          .expect(401);
      });

      it('returns client, client exercises, and client goal if user is admin/provider', () => {
        return supertest(app)
          .get(`/api/clients/${client.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('client');
            expect(res.body.client.id).to.eql(client.id);
            expect(res.body).to.have.property('clientGoal');
            expect(res.body.clientGoal.user_id).to.eql(client.id);
            expect(res.body).to.have.property('clientExercises');
            expect(res.body.clientExercises[0].user_id).to.eql(client.id);
          });
      });
    });
  });
});