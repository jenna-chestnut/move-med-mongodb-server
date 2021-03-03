const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../../src/config');
const contentFixtures = require('./dbcontent.fixtures');

const {
  makeUsersArr,
  makeBodyCatsArr,
  makeComments,
  makeExerciseCatsArr,
  makeUserGoalsArr,
  makeExercisesArr,
  makeUserExercisesArr
} = contentFixtures;

function seedStuff(db, data, key) {
  if (key === 'users') {
    data = data.map((user) => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1),
    }));
  }

  return db
    .into(key)
    .insert(data)
    .then(() =>
    // update the auto sequence to stay in sync
      db.raw(`SELECT setval('${key}_id_seq', ?)`, [
        data[data.length - 1].id,
      ])
    );
}

function makeFixtures() {
  const testUsers = makeUsersArr();
  const testExercises = makeExercisesArr();
  const testUserExercises = makeUserExercisesArr();
  const testComments = makeComments();
  const testCats = makeBodyCatsArr();
  const testExerciseCats = makeExerciseCatsArr();
  const testUserGoals = makeUserGoalsArr();
  return { testUsers, testExercises, testUserExercises, testComments, testCats, testExerciseCats, testUserGoals };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      exercises,
      users,
      user_exercises,
      comments,
      body_categories,
      exercise_body_parts,
      user_goal
      RESTART IDENTITY CASCADE`
  );
}

function seedTables(db, users, exercises = [], user_exercises = [], comments = [], user_goals = [], body_categories = [], exercise_body_parts = []) {
  return db.transaction(async (trx) => {
    await seedStuff(trx, users, 'users');

    exercises.length && await seedStuff(trx, exercises, 'exercises');
    
    user_exercises.length && await seedStuff(trx, user_exercises, 'user_exercises');

    comments.length && (await seedStuff(trx, comments, 'comments'));

    user_goals.length && (await seedStuff(trx, user_goals, 'user_goal'));

    body_categories.length && (await seedStuff(trx, body_categories, 'body_categories'));

    exercise_body_parts.length && (await seedStuff(trx, exercise_body_parts, 'exercise_body_parts'));
  });
}

function makeAuthHeader(user, secret = JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

const makeNewExercise = () => {
  return {
    exercise_name: 'Back Extension', 
    imgurl: 'https://tinyurl.com/y4qwu5kf', 
    videourl: '3UTHsuDl4vw'
  };
};

const makeNewComment = () => {
  return {
    comment_text: 'Feeling AMAZING after this exercise!', 
    user_exercise_id: 1, 
    user_id: 2
  };
};

const makeNewUserExercise = () => {
  return {
    exercise_id: 1, 
    user_id: 2,
    provider_id:  4,
    frequency: 3,
    duration: 'day', 
    add_note:'Gradually increase pressure if it feels right!'
  };
};

const makeNewUser = () => {
  return {
    id: 6,
    full_name: 'New User',
    user_name: 'brandNewUser',
    password: 'SOs0s3cr3t!',
    is_admin: false,
    is_provider: false
  };
};

const makeNewUserGoal = () => {
  return {
    goal_text: 'A NEW GOAL HERE.', 
    user_id: 2
  };
};

module.exports = {
  makeAuthHeader,
  makeFixtures,
  cleanTables,
  seedTables,
  makeNewComment,
  makeNewExercise,
  makeNewUser,
  makeNewUserExercise,
  makeNewUserGoal
};