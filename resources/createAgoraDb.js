// This file creates the projects collection and fills it with the content
// of dbData.json (for some reason it's failing to finish and I have to force
// it Ctl+C but it works)
const fs = require('fs');
const {mongoose} = require('../server/db/mongoose');
const {LawProject} = require('../server/models/lawProject');
const {User}  = require('../server/models/user');

var obj;

fs.readFile(__dirname + '/dbData.json', (err, data) => {
  if (err) throw err;
  obj = JSON.parse(data);

  for (var i = 0; i < obj.length; i++) {
    var temp = obj[i];
    temp = new LawProject(temp);
    obj[i] = temp;
  }
  LawProject.insertMany(obj).then(() => {
    console.log("done!");
  }).catch((e) => {
    console.log(e);
  });
});
