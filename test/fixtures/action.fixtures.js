const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../../src/config');

const {
  makeUsersArr,
  makeExercisesArr,
  makeUserExercisesArr
} = require('./dbcontent.fixtures');

const userEx = makeUserExercisesArr(); 
const ex = makeExercisesArr();
const users = makeUsersArr();

function makeAuthHeader(user, secret = JWT_SECRET) {
  const token = jwt.sign({ 
    user_id: user._id,
    name: user.full_name,
    is_admin: user.is_admin,
    is_provider: user.is_provider
  }, secret, {
    subject: user.user_name,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

const makeNewExercise = () => {
  return {
    exercise_name: 'New Exercises', 
    imgurl: 'https://tinyurl.com/y4qwu5kf', 
    videourl: '3UTHsuDl4vw'
  };
};

const makeNewComment = () => {
  return {
    comment_text: 'Feeling AMAZING after this exercise!', 
    user_exercise: userEx[0]._id
  };
};

const makeNewUserExercise = () => {
  return {
    exercise_id: ex[1]._id, 
    user_id: users[3]._id,
    frequency: 3,
    duration: 'day', 
    add_note:'New exercise. Gradually increase pressure if it feels right!'
  };
};

const makeNewUser = () => {
  return {
    _id: '6048e696450d06099c1c3559',
    full_name: 'New User',
    user_name: 'brandNewUser',
    password: 'SOs0s3cr3t!',
    is_admin: false,
    is_provider: false
  };
};

module.exports = {
  makeAuthHeader,
  makeNewComment,
  makeNewExercise,
  makeNewUser,
  makeNewUserExercise
};