const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String,
    required: true
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => validator.isInt(value,{min: 10000000, max:100000000}),
      message: '{VALUE} is not a valid ID'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => validator.isByteLength(value, {min: 8, max: undefined})
    },
    message: '{VALUE} is not a valid password'
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
}
UserSchema.methods.generateAuthToken = function() { // can't user arrow function, there's no binding for "this"
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'drPatetta').toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};


UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'drPatetta');
  } catch (e) {
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
var User = mongoose.model('Users', UserSchema);

module.exports = {User};
