const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {lawProject} = require('./models/lawProject');

var app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  lawProject.find().then((projects) => {
    res.send(projects);
  }, (e) => {
    res.status(400).send(e);
  });
});

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
