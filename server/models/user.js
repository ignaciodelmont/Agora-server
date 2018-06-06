const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {LawProject} = require('./lawProject');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: {
    type: String
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String
  },
  idNumber: {
    type: String,
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
  }],
  votes: [{
    projectId: {
      type: mongoose.Schema.Types.ObjectId
    },
    vote: {
      type: String
    }
  }]
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email', 'firstName', 'middleName', 'lastName', 'idNumber']);
}
UserSchema.methods.generateAuthToken = function() { // can't use arrow function, there's no binding for "this"
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'drPatetta').toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

UserSchema.methods.updateVote = function (data) {
  var user = this;
  // look for every vote that matches the request
  const result = user.votes.filter( values => (values.projectId == data.id));
  // returns a promise to continue the flow at server.js
  // the promise considers 3 cases,vote doesn't exist, vote already exists or vote is changed
  // any wrong result will reject the promise to send a bad request at server.js
  return new Promise((resolve, reject) => {
    if (result.length == 0) {
      LawProject.findByIdAndUpdate(data.id, {$inc: {[data.vote]: 1}}, {new: true}).then((project) => {
        // to send a language variable as field it's necessary to place it between []
        // (in this case data.vote, switches between favor and against values)
        if (!project) {
          reject();
        }
        user.votes = user.votes.concat([{'projectId': data.id, 'vote': data.vote}]);
        user.save().then((user) => resolve(user)).catch((e) => reject());
      }).catch((e) => {
        reject()
      });
    } else if (result[0].vote == data.vote) {
      resolve(user);
    } else {
      LawProject.findByIdAndUpdate(data.id, {$inc: {[data.vote]: 1, [result[0].vote]: -1}}, {new: true}).then((project) => {
        if (!project) {
          reject();
        }
        user.votes = user.votes.filter( values => (values.projectId != data.id)).concat({'projectId': data.id, 'vote': data.vote});
        user.save().then((user) => resolve(user)).catch((e) => {
          reject()
        });
      }).catch((e) => {
        reject()
      });
    }
  });
}

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
}


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
