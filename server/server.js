// node_modules
const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
// local requires
const {mongoose} = require('./db/mongoose');
const {LawProject} = require('./models/lawProject');
const {User}  = require('./models/user');
const {authenticate} = require('./middleware/authenticate');
var app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

// /projects -------------------------------------------------------------------

// GET every single law project
// Ex: domain/projects
app.get('/projects', (req, res) => {
  LawProject.find().then((projects) => {
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


// updates db from csv file
// fs.createReadStream('expedientes.csv')
// .pipe(csv())
// .on('data', (data) => {
//   var project = new LawProject({
//     caseFileNumber: data['Numero Expediente'],
//     type: data.Tipo,
//     origin: data.Origen,
//     date: data['Fec. Ing. Mesa Entrada\t'],
//     extract: data.Extracto
//   });
//   project.save().then((doc) => {
//     console.log(JSON.stringify(project, undefined, 2));
//   }, (e) => {
//     console.log(e);
//   });
// });

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

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.staus(400).send();
  })
});

// Listening -------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
