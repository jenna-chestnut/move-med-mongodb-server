/* eslint-disable no-useless-escape */
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const Fixtures = require("./fixtures/action.fixtures");

describe("/comments endpoints", () => {
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

  describe("GET /comments/:user_ex_id", () => {

    context('Given an invalid user_ex_id', () => {
      it('responds with 404 not found if invalid id', () => {
        return supertest(app).get("/api/comments/0000")
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
          .expect(404);
      });
    });

    context("Given a correct user exercise endpoint", () => {
      const userEx = testUserExercises[0];
      const user = testUsers[(userEx.user_id) - 1];
      const badUser = testUsers[userEx.user_id];

      it("responds with 200 and the comments array if exercise belongs to user", () => {
        return supertest(app).get(`/api/comments/${userEx.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(user))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body[0].user_id).to.eql(userEx.user_id);
            expect(res.body[0].user_exercise_id).to.eql(userEx.id);
          });
      });

      it("responds with 200 and the comments array if user is admin/provider", () => {
        return supertest(app).get(`/api/comments/${userEx.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(testUsers[0]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body[0].user_id).to.eql(userEx.user_id);
            expect(res.body[0].user_exercise_id).to.eql(userEx.id);
          });
      });

      it("responds with 401 unauthorized if exercise does not belong to user and user is not admin/provider", () => {
        return supertest(app).get(`/api/comments/${userEx.id}`)
          .set('Authorization', Fixtures.makeAuthHeader(badUser))
          .expect(401);
      });
    });
  });

  describe("POST /comments/:user_ex_id", () => {
    const newComment = Fixtures.makeNewComment();
    const userEx = testUserExercises[0];
    const user = testUsers[(userEx.user_id) - 1];
    const badUser = testUsers[userEx.user_id];

    it('responds with 201 and adds comment is user owns exercise', () => {
      return supertest(app)
        .post(`/api/comments/${userEx.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(user))
        .send(newComment)
        .expect(201)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id');
          expect(res.body.user_id).to.eql(userEx.user_id);
          expect(res.body.user_exercise_id).to.eql(userEx.id);
        });
    });

    it('responds with 201 and adds comment if user is admin/provider', () => {
      return supertest(app)
        .post(`/api/comments/${userEx.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(testUsers[4]))
        .send(newComment)
        .expect(201)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id');
          expect(res.body.user_id).to.eql(testUsers[4].id);
          expect(res.body.user_exercise_id).to.eql(userEx.id);
        });
    });

    
    it("responds with 401 unauthorized if exercise does not belong to user and user is not admin/provider", () => {
      return supertest(app).post(`/api/comments/${userEx.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(badUser))
        .send(newComment)
        .expect(401);
    });
  });

  describe("PATCH /comments/:comment_id", () => {
    const newData = { comment_text : 'NEW COMMENT TEXT' };
    const toEdit = testComments[0]; 
    const user = testUsers[(toEdit.user_id) - 1];
    const badUser = testUsers[toEdit.user_id];

    context('Given an invalid user_ex_id', () => {
      it('responds with 404 not found if invalid id', () => {
        return supertest(app).patch("/api/comments/0000")
          .send(newData)
          .set('Authorization', Fixtures.makeAuthHeader(user))
          .expect(404);
      });
    });

    it('returns 401 unauthorized if comment does not belong to user', () => {
      return supertest(app)
        .patch(`/api/comments/${toEdit.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(badUser))
        .send(newData)
        .expect(401);
    });
    
    it('returns 201 and edits exercise if user is admin/provider', () => {
      return supertest(app)
        .patch(`/api/comments/${toEdit.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(user))
        .send(newData)
        .expect(201)
        .then(res => {
          expect(res.body.comment_text).to.eql(newData.comment_text);
        });
    });
  });

  describe("DELETE /comments/:comment_id", () => {
    const toDelete = testComments[0]; 
    const user = testUsers[(toDelete.user_id) - 1];
    const badUser = testUsers[toDelete.user_id];
    
    it(`responds with 404 if invalid comment link`, () => {
      return supertest(app).delete("/api/comments/00000")
        .set('Authorization', Fixtures.makeAuthHeader(user))
        .expect(404);
    });

    it(`responds with 401 if comment does not belong to user`, () => {
      return supertest(app).delete(`/api/comments/${toDelete.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(badUser))
        .expect(401); 
    });

    it("responds with 204 and successfully deletes comment, making it unavailable for deletion", () => {
      return supertest(app).delete(`/api/comments/${toDelete.id}`)
        .set('Authorization', Fixtures.makeAuthHeader(user))
        .expect(204)
        .then(() => {
          return supertest(app).delete(`/api/comments/${toDelete.id}`)
            .set('Authorization', Fixtures.makeAuthHeader(user))
            .expect(404);
        });
    });
  });
});
