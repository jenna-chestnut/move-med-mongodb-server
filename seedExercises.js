require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);

var Exercises = require('./src/models/exercises');

var exercisesData = [
  {
    exercise_name: 'Back Extension', 
    imgurl: 'https://tinyurl.com/y4qwu5kf', 
    videourl: '3UTHsuDl4vw'
  },
  {
    exercise_name: 'Cervical Spine Retraction/Extension', 
    imgurl: 'https://tinyurl.com/y249qrbl', 
    videourl: 'ZY3s2Y1dTck'
  },
  {
    exercise_name: 'Hip Extension', 
    imgurl: 'https://tinyurl.com/yymh2drz', 
    videourl: '5ZdkDtwmgWs'
  },
  {
    exercise_name: 'Thoracic Extension Sitting', 
    imgurl: 'https://tinyurl.com/y4fwrt4l', 
    videourl: 'U-b_36Uc-9E'
  },
  {
    exercise_name: 'Knee Flexion', 
    imgurl: 'https://tinyurl.com/y2jmtb3e', 
    videourl: 'lMpP4ngZKw4'
  },
  {
    exercise_name: 'Elbow Extension', 
    imgurl: 'https://tinyurl.com/y3lqkavl', 
    videourl: 'ry8lUjavfr8'
  },
  {
    exercise_name: 'Inner Thigh Stretch', 
    imgurl: 'https://tinyurl.com/yxnav4jd', 
    videourl: 'S37HKFbpx4U'
  },
  {
    exercise_name: 'Wrist Extension', 
    imgurl: 'https://tinyurl.com/y3havjyj', 
    videourl: 'dyCAYuT77iQ'
  },
  {
    exercise_name: 'Shoulder Internal Rotation', 
    imgurl: 'https://tinyurl.com/y37oj8lz', 
    videourl: 'Ab6jLeQfHvg'
  }
];

Exercises.remove({}, function(err, removed) {
  if (err) {
    console.log('Database Error: ', err);
  }

  Exercises.create(exercisesData, function(err, exercises) {
    if (err) {
      console.log('Database Error: ', err);
    }

    console.log('Exercises inserted: ', exercises);
    process.exit();
  });
});