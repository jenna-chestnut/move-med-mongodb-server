const makeUsersArr = () => {
  return [
    {
      id: 1,
      user_name: 'User1',
      full_name: 'FullName1',
      password: 'Password1',
      is_admin: true,
      is_provider: true
    },
    {
      id: 2,
      user_name: 'User2',
      full_name: 'FullName2',
      password: 'Password2',
      is_admin: false,
      is_provider: false
    },
    {
      id: 3,
      user_name: 'User3',
      full_name: 'FullName3',
      password: 'Password3',
      is_admin: false,
      is_provider: false
    },
    {
      id: 4,
      user_name: 'User4',
      full_name: 'FullName4',
      password: 'Password4',
      is_admin: false,
      is_provider: false
    },
    {
      id: 5,
      user_name: 'User5',
      full_name: 'FullName5',
      password: 'Password5',
      is_admin: false,
      is_provider: true
    },
  ];
};

const makeExercisesArr = () => {
  return [
    {
      id: 1,
      exercise_name: 'Back Extension', 
      imgurl: 'https://tinyurl.com/y4qwu5kf', 
      videourl: '3UTHsuDl4vw'
    },
    {
      id: 2,
      exercise_name: 'Cervical Spine Retraction/Extension', 
      imgurl: 'https://tinyurl.com/y249qrbl', 
      videourl: 'ZY3s2Y1dTck'
    },
    {
      id: 3,
      exercise_name: 'Hip Extension', 
      imgurl: 'https://tinyurl.com/yymh2drz', 
      videourl: '5ZdkDtwmgWs'
    },
    {
      id: 4,
      exercise_name: 'Thoracic Extension Sitting', 
      imgurl: 'https://tinyurl.com/y4fwrt4l', 
      videourl: 'U-b_36Uc-9E'
    },
    {
      id: 5,
      exercise_name: 'Knee Flexion', 
      imgurl: 'https://tinyurl.com/y2jmtb3e', 
      videourl: 'lMpP4ngZKw4'
    },
    {
      id: 6,
      exercise_name: 'Elbow Extension', 
      imgurl: 'https://tinyurl.com/y3lqkavl', 
      videourl: 'ry8lUjavfr8'
    },
    {
      id: 7,
      exercise_name: 'Inner Thigh Stretch', 
      imgurl: 'https://tinyurl.com/yxnav4jd', 
      videourl: 'S37HKFbpx4U'
    },
    {
      id: 8,
      exercise_name: 'Wrist Extension', 
      imgurl: 'https://tinyurl.com/y3havjyj', 
      videourl: 'dyCAYuT77iQ'
    },
    {
      id: 9,
      exercise_name: 'Shoulder Internal Rotation', 
      imgurl: 'https://tinyurl.com/y37oj8lz', 
      videourl: 'Ab6jLeQfHvg'
    }];
};

const makeBodyCatsArr = () => {
  return [
    { 
      id: 1,
      body_part: 'Back'
    },
    { 
      id: 2,
      body_part: 'Neck'
    },
    { 
      id: 3,
      body_part: 'Shoulder'
    },
    { 
      id: 4,
      body_part: 'Knee'
    },
    { 
      id: 5,
      body_part: 'Hip'
    },
    { 
      id: 6,
      body_part: 'Leg'
    },
    { 
      id: 7,
      body_part: 'Elbow'
    },
    { 
      id: 8,
      body_part: 'Wrist'
    }
  ];
};

const makeExerciseCatsArr = () => {
  return [{
    id: 1,
    exercise_id: 1,
    body_category_id: 1
  },
  {
    id: 2,
    exercise_id: 2,
    body_category_id: 2
  },
  {
    id: 3,
    exercise_id: 3,
    body_category_id: 5
  },
  {
    id: 4,
    exercise_id: 4,
    body_category_id: 1
  },
  {
    id: 5,
    exercise_id: 4,
    body_category_id: 2
  },
  {
    id: 6,
    exercise_id: 4,
    body_category_id: 3
  },
  {
    id: 7,
    exercise_id: 5,
    body_category_id: 4
  },
  {
    id: 8,
    exercise_id: 6,
    body_category_id: 7
  },
  {
    id: 9,
    exercise_id: 6,
    body_category_id: 8
  },
  {
    id: 10,
    exercise_id: 7,
    body_category_id: 5
  },
  {
    id: 11,
    exercise_id: 7,
    body_category_id: 6
  },
  {
    id: 12,
    exercise_id: 8,
    body_category_id: 8
  },
  {
    id: 13,
    exercise_id: 8,
    body_category_id: 7
  },
  {
    id: 14,
    exercise_id: 9,
    body_category_id: 2
  },
  {
    id: 15,
    exercise_id: 9,
    body_category_id: 3
  }];
};

const makeUserExercisesArr = () => {
  return [
    {
      id: 1,
      exercise_id: 1, 
      user_id: 2,
      provider_id:  4,
      frequency: 3,
      duration: 'day', 
      add_note:'Gradually increase pressure if it feels right!'
    },
    {
      id: 2,
      exercise_id: 2, 
      user_id: 2,
      provider_id:  4,
      frequency: 1,
      duration: 'hour',
      add_note: 'Take this one slowly, hold off if it hurts.'
    },
    {
      id: 3,
      exercise_id: 4, 
      user_id: 2,
      provider_id:  4,
      frequency: 3,
      duration: 'day', 
      add_note:'Be sure to do before bed'
    },
    {
      id: 4,
      exercise_id: 3, 
      user_id: 3,
      provider_id:  4,
      frequency: 1,
      duration: '2 hours',
      add_note: 'Be sure to do before & after runnning'
    },
    {
      id: 5,
      exercise_id: 5, 
      user_id: 3,
      provider_id:  4,
      frequency: 2,
      duration: 'day', 
      add_note:'Post swim exercise.'
    },
    {
      id: 6,
      exercise_id: 7, 
      user_id: 3,
      provider_id:  4,
      frequency: 1,
      duration: 'hour',
      add_note: '10 reps per day maximum!'
    },
    {
      id: 7,
      exercise_id: 6, 
      user_id: 5,
      provider_id:  4,
      frequency: 4,
      duration: 'day', 
      add_note:'Let us know if you have any questions!'
    },
    {
      id: 8,
      exercise_id: 8, 
      user_id: 5,
      provider_id:  4,
      frequency: 1,
      duration: '4 hours',
      add_note: 'Very important - set an alarm if you need a reminder!'
    },
    {
      id: 9,
      exercise_id: 9, 
      user_id: 5,
      provider_id:  4,
      frequency: 2,
      duration: 'hour',
      add_note: 'Before softball games'
    },
    {
      id: 10,
      exercise_id: 2, 
      user_id: 5,
      provider_id:  4,
      frequency: 1,
      duration: 'hour',
      add_note: 'During work in the office'
    },
    {
      id: 11,
      exercise_id: 1, 
      user_id: 5,
      provider_id:  4,
      frequency: 3,
      duration: 'day', 
      add_note:'Can do sitting or standing version'
    }];
};

const makeUserGoalsArr = () => {
  return [{
    id: 1,
    goal_text: 'Get back into your swim team without achy knees!', 
    user_id: 3
  },
  {
    id: 2,
    goal_text: 'Fix your posture so you can sit and stand taller & without pain', 
    user_id: 2
  },
  {
    id: 3,
    goal_text: 'Feel more comfortable overall, without being afraid of falling or getting injured.', 
    user_id: 5
  }];
};

const makeComments = () => {
  return [{
    id: 1,
    comment_text: 'Started to ache after nth rep', 
    user_exercise_id: 2, 
    user_id: 2
  },
  {
    id: 2,
    comment_text: 'Feeling AMAZING after this exercise!', 
    user_exercise_id: 3, 
    user_id: 2
  },
  {
    id: 3,
    comment_text: 'Started to ache after nth rep', 
    user_exercise_id: 1, 
    user_id: 2
  },
  {
    id: 4,
    comment_text: 'You can hold off for now if it\'s bothering you', 
    user_exercise_id: 2, 
    user_id: 4
  },
  {
    id: 5,
    comment_text: 'Feeling AMAZING after this exercise!', 
    user_exercise_id: 4, 
    user_id: 3
  },
  {
    id: 6,
    comment_text: 'You can hold off for now if it\'s bothering you', 
    user_exercise_id: 4, 
    user_id: 4
  },
  {
    id: 7,
    comment_text: 'I don\'t feel anything when I do this exercise..', 
    user_exercise_id: 5, 
    user_id: 3
  },
  {
    id: 8,
    comment_text: 'Started to ache after nth rep', 
    user_exercise_id: 6, 
    user_id: 3
  },
  {
    id: 9,
    comment_text: 'I don\t feel anything when I do this exercise..', 
    user_exercise_id: 7, 
    user_id: 5
  },
  {
    id: 10,
    comment_text: 'Feeling AMAZING after this exercise!', 
    user_exercise_id: 8, 
    user_id: 5
  },
  {
    id: 11,
    comment_text: 'We\'ll be sure to discuss at your next appointment!', 
    user_exercise_id: 8, 
    user_id: 4
  },
  {
    id: 12,
    comment_text: 'You can hold off for now if it\'s bothering you', 
    user_exercise_id: 3, 
    user_id: 4
  },
  {
    id: 13,
    comment_text: 'Started to ache after nth rep', 
    user_exercise_id: 9, 
    user_id: 5
  },
  {
    id: 14,
    comment_text: 'I don\'t feel anything when I do this exercise..', 
    user_exercise_id: 10,
    user_id:  
    5},
  {
    id: 15,
    comment_text: 'We\'ll be sure to discuss at your next appointment!', 
    user_exercise_id: 10,
    user_id:  
    4
  }];
};

module.exports = {
  makeUsersArr,
  makeBodyCatsArr,
  makeComments,
  makeExerciseCatsArr,
  makeUserGoalsArr,
  makeExercisesArr,
  makeUserExercisesArr
};