require('dotenv').config();
const mongoose = require('mongoose');
const BodyCategory = require('../src/models/body-category.model');

mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const bodyCategoryData = [
  {
    body_part: 'Back'
  },
  {
    body_part: 'Neck'
  },
  {
    body_part: 'Shoulder'
  },
  {
    body_part: 'Knee'
  },
  {
    body_part: 'Hip'
  },
  {
    body_part: 'Leg'
  },
  {
    body_part: 'Elbow'
  },
  {
    body_part: 'Wrist'
  }
];

BodyCategory.remove({}, function(err, removed) {
  if (err) {
    console.log('Database Error: ', err);
  }

  BodyCategory.create(bodyCategoryData, function(err, categories) {
    if (err) {
      console.log('Database Error: ', err);
    }

    console.log('Categories inserted: ', categories);
    process.exit();
  });
});