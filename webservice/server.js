var express = require('express'),
  app = express(),
  port = 3000,
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session');


var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

app.use(cookieSession({
  name: 'session',
  keys: ['secterKey'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/test', function (req, res) {
  res.send('Hello World!')
});

var routes = require('./api/routes/routes'); //importing route
routes(app, web3); //register the route

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);
