const fs = require('fs');

var logger = function (req, res, next) {
  log = '-------------------------------'.concat(req.method).concat(" method ").concat(Date().toString()).concat('-------------------------------');
  console.log(log);
  fs.appendFile('../server.log', log + '\n', (err) => {
    if (err) {
      console.log('Unable to append to server.log');
    }
  })
  next();
}

module.exports = logger;
