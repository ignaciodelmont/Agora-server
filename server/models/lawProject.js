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
var LawProject = mongoose.model('Projects', lawProjectSchema);

module.exports = {LawProject};
