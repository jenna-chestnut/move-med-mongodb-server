const mongoose = require('mongoose');

const exercisesSchema = new mongoose.Schema({
  exercise_name: { type: String, required: true },
  imgurl: { type: String, required: true },
  videourl: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now() }
});

const Exercises = mongoose.model('Exercises', exercisesSchema);

module.exports = Exercises;