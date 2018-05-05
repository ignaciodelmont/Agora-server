var logger = function (req, res, next) {
  console.log('-------------------------------'.concat(req.method).concat(" method ").concat(Date().toString()).concat('-------------------------------'));
  next();
}

module.exports = logger;
