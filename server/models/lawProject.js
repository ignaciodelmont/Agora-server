const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var lawProjectSchema = new Schema({
  startedAt: {
    type: String,
    required: true,
    minlength:1
  },
  caseFile: {
    type: String,
    required: true,
    minlength: 1
  },
  publishedAt: {
    type: String,
  },
  date: {
    type: String,
  },
  extract: {
    type: String,
    required: true,
    minlength:1
  },
  year: {
    type: Number
  },
  month: {
    type: Number
  },
  day: {
    type: Number
  },
  favor: {
    type: Number,
    default: 0
  },
  against: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String]
  },
  link: {
    type: String
  }
});

lawProjectSchema.statics.loadProjects = function (loaded, limit) {
  loaded = parseInt(loaded);
  limit = parseInt(limit);
  if (!loaded) {
    loaded = 0;
  }
  if (!limit || limit > 100) {
    limit = 20;
  }

  return new Promise((resolve, reject) => {
    LawProject.find().skip(loaded).limit(limit)
      .then((projects) => resolve(projects))
      .catch((e) => reject(e));

  });
}


var LawProject = mongoose.model('Projects', lawProjectSchema);
module.exports = {LawProject};
