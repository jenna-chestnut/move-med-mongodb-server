require('dotenv').config();
const mongoose = require('mongoose');
const Exercise = require('../../src/models/exercise.model');
const User = require('../../src/models/user.model');
const UserExercise = require('../../src/models/user-exercise.model');
const Comment = require('../../src/models/comment.model');
const bcrypt = require('bcryptjs');
const { makeFixtures } = require('./dbcontent.fixtures');
const {
  users,
  comments,
  exercises,
  user_exercises
} = makeFixtures();

mongoose.connect(process.env.TEST_ATLAS_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const toSeed = [
  { name: 'Exercises', model: Exercise,  data: exercises },
  { name: 'Users', model: User, data: users.map(el => {
    el.password = bcrypt.hashSync(el.password, 1);
    return el; 
  })
  },
  { name: 'UserExercises', model: UserExercise, data: user_exercises },
  { name: 'Comments', model: Comment, data: comments }
];

const seedTestTables = () => {
  toSeed.forEach(el => {

    el.model.deleteMany({}, function(err, removed) {
      if (err) {
        console.log('Database Error: ', err);
      }
    
      el.model.create(el.data, function(err, data) {
        if (err) {
          console.log('Database Error: ', err);
        }
    
        console.log(`${el.name} inserted`);
      });
    });
  });
};

const clearTables = () => {
  toSeed.forEach(el => {
    el.model.deleteMany({});
  });
};

module.exports = {
  seedTestTables,
  clearTables
};