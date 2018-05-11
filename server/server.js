// node_modules
const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const hbs = require('hbs');
const path = require('path');
// local requires
const {mongoose} = require('./db/mongoose');
const {LawProject} = require('./models/lawProject');
const {User}  = require('./models/user');
const {authenticate} = require('./middleware/authenticate');
const logger = require('./middleware/logger');
var app = express();
app.use([bodyParser.json(),logger]);
const port = process.env.PORT || 3000;


// HBS
// Partials register
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));
hbs.registerPartials(path.join(__dirname, '../views/partials'));
// Helpers register
hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

hbs.registerHelper('loadMore', () => {
  return LawProject.find().skip(10).limit(10).then((projects) => {
    resolve(projects);//JSON.stringify(projects, undefined, 2);
  }, (e) => {
    return "Bye";
  });
});
// server log
app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;

  console.log(log);
  fs.appendFile('server.log', log + '\n', (err) => {
    if (err) {
      console.log('Unable to append to server.log');
    }
  });

  next();
});
// /projects -------------------------------------------------------------------

app.get('/', (req, res) => {
  res.render('index.hbs');
}, (e) => {
  res.status(400).send();
});
// GET every single law project
// Ex: domain/projects
app.get('/projects', (req, res) => {
  LawProject.find().limit(20).then((projects) => {
    res.send(projects);
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET by Id a single project
// Ex: /projects/domain/5adfe95d3a49cb56a269b195
app.get('/projects/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  LawProject.findById(id).then((project) => {
    if (!project) {
      return res.status(404).send();
    }
    res.send(project);
  }, (e) => {
    res.status(400).send(e);
  });
});

// DELETE by Id a single project
// Ex: domain/projects/5adfe95d3a49cb56a269b195
app.delete('/projects/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id))
    return res.status(404).send();

  LawProject.findByIdAndRemove(id).then((todo) => {
    if (!todo)
      return res.status(404).send();

    res.status(200).send();
    console.log(todo);
  },(e) => res.status(400).send());
});

// PATCH by Id a single project
// Ex: domain/projects/5adfe95d3a49cb56a269b195/favor or domain/projects/5adfe95d3a49cb56a269b195/against
app.patch('/projects/:id/:vote', authenticate, (req, res) => {
  var data = {
    "id": req.params.id,
    "vote": req.params.vote
  };
  var user = req.user;

  if (!ObjectID.isValid(data.id) || data.vote != 'favor' && data.vote != 'against')
    return res.status(404).send();

  user.updateVote(data).then((user) => {
    console.log(user);
    res.status(200).send();
  }).catch((e) => {
    res.status(400).send();
  });

});



// /users ----------------------------------------------------------------------

// POST /users
// Ex: domain/users (body = {email, password, firstName, middleName, lastName, idNumber})
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email','password','firstName','middleName','lastName','idNumber']);
  console.log(req.body);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// POST /users/login
// Ex: domain/users (body = {email, password})
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

// GET user
app.get('/users/me', authenticate, (req, res) => {
  res.render('user.hbs',{
    user: req.user
  });
});

// DELETE user's token
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.staus(400).send();
  })
});

// GET all user's votes
app.get('/users/me/myVotes', authenticate, (req, res) => {
  var user = req.user;
  var votesId = (user.votes).map( voteId => voteId.projectId);
  console.log(votesId);

  LawProject.find({_id: {$in: votesId}}).then((project) => {
    res.status(200).send(project);
  }).catch((e) => {
    res.status(404).send();
  });

})

// Listening -------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
