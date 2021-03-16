/* eslint-disable no-undef */
const supertest = require('supertest');
const app = require('../src/app');
const { TEST_ATLAS_URI } = process.env;
const mongoose = require('mongoose');
const { seedTestTables, clearTables } = require('./Fixtures/seedTestTables');
const Content = require('./Fixtures/dbcontent.fixtures');
const Actions = require('./Fixtures/action.fixtures');

describe('/comments endpoints', () => {
  before('connect to db', () => {
    mongoose.connect(TEST_ATLAS_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
    const { connection } = mongoose;
    connection.once('open', () => {
      console.log('MongoDB database connected successfully');
    });
  });
  
  after('disconnect from db', () => mongoose.connection.close());

  const testUsers = Content.makeUsersArr();
  const testUserExercises = Content.makeUserExercisesArr();
  const testComments = Content.makeComments();

  describe('GET /comments/:user_ex_id', () => {

    context('Given an invalid user_ex_id', () => {
      it('responds with 404 not found if invalid id', () => {
        before('seed tables', () => seedTestTables());
        return supertest(app).get('/api/comments/0000')
          .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
          .expect(404);
      });
    });

    context('Given a correct user exercise endpoint', () => {
      const userEx = testUserExercises[0];
      const user = testUsers[1];
      const badUser = testUsers[2];

      it('responds with 200 and the comments array if exercise belongs to user', () => {
        return supertest(app).get(`/api/comments/${userEx._id}`)
          .set('Authorization', Actions.makeAuthHeader(user))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body[0].user_id).to.eql(userEx.user_id);
            expect(res.body[0].user_exercise).to.eql(userEx._id);
          });
      });

      it('responds with 200 and the comments array if user is admin/provider', () => {
        return supertest(app).get(`/api/comments/${userEx._id}`)
          .set('Authorization', Actions.makeAuthHeader(testUsers[0]))
          .expect(200)
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body[0].user_id).to.eql(userEx.user_id);
            expect(res.body[0].user_exercise).to.eql(userEx._id);
          });
      });

      it('responds with 401 unauthorized if exercise does not belong to user and user is not admin/provider', () => {
        return supertest(app).get(`/api/comments/${userEx._id}`)
          .set('Authorization', Actions.makeAuthHeader(badUser))
          .expect(401);
      });
    });
  });

  describe('POST /comments/:user_ex_id', () => {
    const newComment = Actions.makeNewComment();
    const userEx = testUserExercises[0];
    const user = testUsers[1];
    const badUser = testUsers[2];

    it('responds with 201 and adds comment is user owns exercise', () => {
      before('seed tables', () => seedTestTables());
      return supertest(app)
        .post(`/api/comments/${userEx._id}`)
        .set('Authorization', Actions.makeAuthHeader(user))
        .send(newComment)
        .expect(201)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('_id');
          expect(res.body.user_id).to.eql(userEx.user_id);
          expect(res.body.user_exercise).to.eql(userEx._id);
        });
    });

    it('responds with 201 and adds comment if user is admin/provider', () => {
      return supertest(app)
        .post(`/api/comments/${userEx._id}`)
        .set('Authorization', Actions.makeAuthHeader(testUsers[4]))
        .send(newComment)
        .expect(201)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('_id');
          expect(res.body.user_id).to.eql(testUsers[4]._id);
          expect(res.body.user_exercise).to.eql(userEx._id);
        });
    });

    
    it('responds with 401 unauthorized if exercise does not belong to user and user is not admin/provider', () => {
      return supertest(app).post(`/api/comments/${userEx._id}`)
        .set('Authorization', Actions.makeAuthHeader(badUser))
        .send(newComment)
        .expect(401);
    });
  });

  describe('PATCH /comments/:comment_id', () => {
    const newData = { comment_text : 'NEW COMMENT TEXT' };
    const toEdit = testComments[0]; 
    const user = testUsers[1];
    const badUser = testUsers[2];

    it('responds with 404 not found if invalid id', () => {
      before('seed tables', () => seedTestTables());

      return supertest(app).patch('/api/comments/0000')
        .send(newData)
        .set('Authorization', Actions.makeAuthHeader(user))
        .expect(404);
    });

    it('returns 401 unauthorized if comment does not belong to user', () => {
      return supertest(app)
        .patch(`/api/comments/${toEdit._id}`)
        .set('Authorization', Actions.makeAuthHeader(badUser))
        .send(newData)
        .expect(401);
    });
    
    it('returns 201 and edits comment if user is admin/provider', () => {
      return supertest(app)
        .patch(`/api/comments/${toEdit._id}`)
        .set('Authorization', Actions.makeAuthHeader(user))
        .send(newData)
        .expect(201)
        .then(res => {
          expect(res.body.comment_text).to.eql(newData.comment_text);
        });
    });
  });

  describe('DELETE /comments/:comment_id', () => {
    const toDelete = testComments[0]; 
    const user = testUsers[1];
    const badUser = testUsers[2];

    it('responds with 404 if invalid comment link', () => {
      before('seed tables', () => seedTestTables());
      return supertest(app).delete('/api/comments/00000')
        .set('Authorization', Actions.makeAuthHeader(user))
        .expect(404);
    });

    it('responds with 401 if comment does not belong to user', () => {
      return supertest(app).delete(`/api/comments/${toDelete._id}`)
        .set('Authorization', Actions.makeAuthHeader(badUser))
        .expect(401); 
    });

    it('responds with 204 and successfully deletes comment, making it unavailable for deletion', () => {
      return supertest(app).delete(`/api/comments/${toDelete._id}`)
        .set('Authorization', Actions.makeAuthHeader(user))
        .expect(204)
        .then(() => {
          return supertest(app).delete(`/api/comments/${toDelete._id}`)
            .set('Authorization', Actions.makeAuthHeader(user))
            .expect(404);
        });
    });
  });
});
