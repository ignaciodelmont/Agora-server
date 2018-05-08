// This code modifies the array of objects and creates a new file 'dbData.json'
// stored in data.json file created by fetchData.js

var fs = require('fs');
var obj;

fs.readFile(__dirname + '/data.json', (err, data) => {
  if (err) throw err;
  obj = JSON.parse(data);
  for (var i = 0; i < obj.length; i++) {
    var temp = obj[i];

    temp.startedAt = temp.startedAt.substring(temp.startedAt.indexOf(":") + 2,);
    if (temp.startedAt != 'Diputados') {
      temp.publishedAt = temp.date.substring(temp.date.indexOf(":") + 2,);
      temp.date = "";
    } else {
      temp.publishedAt = temp.publishedAt.substring(temp.publishedAt.indexOf(":") + 2,);
      var date = temp.date.substring(temp.date.indexOf(":") + 2,);
      date = date.split("/");
      temp.date = new Date(date[2], date[1] - 1, date[0]);
      temp.year = parseInt(date[2], 10);
      temp.month = parseInt(date[1], 10);
      temp.day = parseInt(date[0], 10);
    }
    temp.caseFile = temp.caseFile.substring(temp.caseFile.indexOf(":") + 2,);
    obj[i] = temp;
  }

  fs.appendFile('dbData.json',JSON.stringify(obj, undefined, 2), (err) => {
    if (err) throw err;
  });

});
