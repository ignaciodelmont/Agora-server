const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var lawProjectSchema = new Schema({
  caseFileNumber: {
    type: String,
    required: true,
    minlength: 1
  },
  type: {
    type: String,
    required: true,
    minlength:1
  },
  origin: {
    type: String,
    required: true,
    minlength:1
  },
  date: {
    type: String,
    required: true,
    minlength:1
  },
  extract: {
    type: String,
    required: true,
    minlength:1
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
  }
})
var LawProject = mongoose.model('Projects', lawProjectSchema);

module.exports = {LawProject};
