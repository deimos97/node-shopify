var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(200);
  res.send('respond with a resourcee');
});

/* Test */
router.get('/:userID', function(req, res, next) {
  res.json({ 
    id: '1',
    name: req.params.userID
  });
});

module.exports = router;
