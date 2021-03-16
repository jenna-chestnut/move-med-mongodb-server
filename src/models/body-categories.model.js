const mongoose = require('mongoose');

const bodyCategorySchema = new mongoose.Schema({
  body_part: { type: String, required: true }
});

const BodyCategory = mongoose.model('BodyCategory', bodyCategorySchema);

module.exports = BodyCategory;