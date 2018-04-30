const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {lawProject} = require('./models/lawProject');

var app = express();
const port = process.env.PORT || 3000;


// GET every single law project
// Ex: domain/
app.get('/', (req, res) => {
  lawProject.find().then((projects) => {
    res.send(projects);
  }, (e) => {
    res.status(400).send(e);
  });
});


// GET by Id a single project
// Ex: domain/5adfe95d3a49cb56a269b195
app.get('/:id', (req, res) => {
  var id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  lawProject.findById(id).then((project) => {
    if (!project) {
      return res.status(404).send();
    }
    res.send(project);
  }, (e) => {
    res.status(400).send(e);
  });
});

// DELETE by Id a single project
// Ex: domain/5adfe95d3a49cb56a269b195
app.delete('/:id', (req, res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id))
    return res.status(404).send();

  lawProject.findByIdAndRemove(id).then((todo) => {
    if (!todo)
      return res.status(404).send();

    res.status(200).send();
    console.log(todo);
  },(e) => res.status(400).send());
});

// PATCH by Id a single project
// Ex: domain/5adfe95d3a49cb56a269b195/favor or domain/5adfe95d3a49cb56a269b195/against
app.patch('/:id/:vote', (req, res) => {
  var data = {
    "id": req.params.id,
    "vote": req.params.vote
  };
  if (!ObjectID.isValid(data.id) || data.vote != 'favor' && data.vote != 'against')
    return res.status(404).send();

  lawProject.findByIdAndUpdate(data.id, {$inc: {[data.vote]: 1}}, {new: true}).then((project) => {
    // to send a language variable as field it's necessary to place it between []
    // (in this case data.vote, switches between favor and against values)
    if (!project)
      return res.status(404).send();

    res.status(200).send({project});
  }).catch((e) => {
    res.status(400).send();
  });

});
// updates db from csv file
// fs.createReadStream('expedientes.csv')
// .pipe(csv())
// .on('data', (data) => {
//   var project = new lawProject({
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


// Listening
  app.listen(port, () => {
    console.log(`Started on port ${port}`);
  });
