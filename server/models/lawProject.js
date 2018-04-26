const mongoose = require('mongoose');

var lawProject = mongoose.model('Projects', {
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
  }
});

module.exports = {lawProject};
