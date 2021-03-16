require('dotenv').config();
const mongoose = require('mongoose');
const Comment = require('../src/models/comment.model');

mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const commentData = [
  {
    comment_text: 'Started to ache after nth rep', 
    user_exercise_id: '60467d7375d2cd48b1aad720', 
    user_id: '604678e5852243bcc80b3558'
  },
  {
    comment_text: 'Feeling AMAZING after this exercise!', 
    user_exercise_id: '60467d7375d2cd48b1aad721', 
    user_id: '604678e5852243bcc80b3558'
  },
  {
    comment_text: 'Started to ache after nth rep', 
    user_exercise_id: '60467d7375d2cd48b1aad722', 
    user_id: '604678e5852243bcc80b3558'
  },
  {
    comment_text: 'You can hold off for now if it\'s bothering you', 
    user_exercise_id: '60467d7375d2cd48b1aad720', 
    user_id: '604678e5852243bcc80b355a'
  },
  {
    comment_text: 'Feeling AMAZING after this exercise!', 
    user_exercise_id: '60467d7375d2cd48b1aad723', 
    user_id: '604678e5852243bcc80b3559'
  },
  {
    comment_text: 'You can hold off for now if it\'s bothering you', 
    user_exercise_id: '60467d7375d2cd48b1aad722', 
    user_id: '604678e5852243bcc80b355a'
  },
  {
    comment_text: 'I don\'t feel anything when I do this exercise..', 
    user_exercise_id: '60467d7375d2cd48b1aad729', 
    user_id: '604678e5852243bcc80b3559'
  },
  {
    comment_text: 'Started to ache after nth rep', 
    user_exercise_id: '60467d7375d2cd48b1aad723', 
    user_id: '604678e5852243bcc80b3559'
  },
  {
    comment_text: 'I don\t feel anything when I do this exercise..', 
    user_exercise_id: '60467d7375d2cd48b1aad727', 
    user_id: '604678e5852243bcc80b355b'
  },
  {
    comment_text: 'Feeling AMAZING after this exercise!', 
    user_exercise_id: '60467d7375d2cd48b1aad725', 
    user_id: '604678e5852243bcc80b355b'
  },
  {
    comment_text: 'We\'ll be sure to discuss at your next appointment!', 
    user_exercise_id: '60467d7375d2cd48b1aad721', 
    user_id: '604678e5852243bcc80b355a'
  },
  {
    comment_text: 'You can hold off for now if it\'s bothering you', 
    user_exercise_id: '60467d7375d2cd48b1aad726', 
    user_id: '604678e5852243bcc80b355a'
  },
  {
    comment_text: 'Started to ache after nth rep', 
    user_exercise_id: '60467d7375d2cd48b1aad726', 
    user_id: '604678e5852243bcc80b355b'
  },
  {
    comment_text: 'I don\'t feel anything when I do this exercise..', 
    user_exercise_id: '60467d7375d2cd48b1aad724',
    user_id: '604678e5852243bcc80b355b'
  },
  {
    comment_text: 'We\'ll be sure to discuss at your next appointment!', 
    user_exercise_id: '60467d7375d2cd48b1aad723',
    user_id: '604678e5852243bcc80b355a'
  }
];

Comment.remove({}, function(err, removed) {
  if (err) {
    console.log('Database Error: ', err);
  }

  Comment.create(commentData, function(err, comments) {
    if (err) {
      console.log('Database Error: ', err);
    }

    console.log('Comments inserted: ', comments);
    process.exit();
  });
});