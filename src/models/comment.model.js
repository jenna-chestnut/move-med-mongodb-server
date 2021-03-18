const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  user_exercise: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user_exercise'},
  comment_text: { type: String, required: true },
  date_created: { type: Date, default: Date.now() }
});

const UserExercise = mongoose.model('Comment', commentSchema);

module.exports = UserExercise;