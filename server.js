//hello world server using express beginning of project
var express = require('express');
var app = express(); //create express object

/*app.get('/', function (req, res) {  //create get route for root directory
  res.send('Hello World!');
});*/

app.use('/', express.static(__dirname + '/public'));

app.listen(3000, function () { //start listening for activity on port 3000
  console.log('Example app listening on port 3000!');
});
