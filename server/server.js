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
app.get('/', (req, res) => {
  lawProject.find().then((projects) => {
    res.send(projects);
  }, (e) => {
    res.status(400).send(e);
  });
});


// GET by Id a single project
app.get('/:id', (req, res) => {
  const id = req.params.id;
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

// updates db from csv file
fs.createReadStream('expedientes.csv')
  .pipe(csv())
  .on('data', (data) => {
    var project = new lawProject({
      caseFileNumber: data['Numero Expediente'],
      type: data.Tipo,
      origin: data.Origen,
      date: data['Fec. Ing. Mesa Entrada\t'],
      extract: data.Extracto
    });
    project.save().then((doc) => {
      console.log(JSON.stringify(project, undefined, 2));
    }, (e) => {
      console.log(e);
    });
  });

  app.listen(port, () => {
    console.log(`Started on port ${port}`);
  });
