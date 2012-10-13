// BigScreensServer

//Note: Processing must be connected to the TCP server prior to sending messages.

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , util = require('util')
  , net = require('net');

var app = express();

// TCP server host and port:
var HOST = 'localhost';
var PORT = 7004;

// Global var to contain the socket from processing
var PROCESSING = null; 

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

// Create a function to handle our incoming SMS requests
app.post('/incoming', function(req, res) {

  console.log("message incoming!");

  // Extract the From and Body values from the POST data
  var message = req.body.Body;
  var from = req.body.From;
  messageAsString = message.toString('utf8');
  
  // Send message to Processing
  PROCESSING.write(messageAsString);
  
  util.log('From: ' + from + ', Message: ' + message);
  
  // Return sender a very nice message
  // twiML to be executed when SMS is received
  var twiml = '<Response><Sms>your SMS reached the server!</Sms></Response>';
  res.send(twiml, {'Content-Type':'text/xml'}, 200);
});

// Initialize a TCP server
var server = net.createServer(function (socket) {
  
  // PROCESSING is a global socket
  PROCESSING = socket;

  socket.addListener("connect", function () {
    util.puts("Connection from " + socket.remoteAddress);
  });
});

// TCP server
server.listen(PORT, HOST);
// Put a friendly message on the terminal
console.log("TCP server listening on: " + HOST + ':' + PORT);

// Express
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
