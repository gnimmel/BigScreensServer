// linode or EC2
// microinstance

/*
 * Module dependencies.
 */

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
var PORT = 80;

var app = express();

// global vars
PROCESSING = null;

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

// Create a function to handle our incoming SMS requests (POST request)
app.post('/incoming', function(req, res) {
  // Extract the From and Body values from the POST data
  console.log("message incoming!!!");
  var message = req.body.Body;
  var from = req.body.From;
  var messageAsString = message.toString('utf8');
  
  // send to processing
  PROCESSING.write(messageAsString);
  
  util.log('From: ' + from + ', Message: ' + message);
  
  // Return sender a very nice message
  // twiML to be executed when SMS is received
  var twiml = '<Response><Sms>your SMS reached the server!</Sms></Response>';
  res.send(twiml, {'Content-Type':'text/xml'}, 200);
});


// Setup a tcp server
var server = net.createServer(function (socket) {
  // PROCESSING is global socket
  PROCESSING = socket;

  socket.addListener("connect", function () {
    util.puts("Connection from " + socket.remoteAddress);
    //socket.write(messageAsString);
  });

  socket.addListener('data', function(data){
    console.log("received" + data);
    socket.write("thank you for the data");
  });

});

/*
counter = 0;
setInterval(function() {
  tmpMessage = getMessage();

  if (PROCESSING != null ) {
    //write to processing
    // PROCESSING.write("counter:"+ counter);
    // counter++;

      if (tmpMessage != null) {
        PROCESSING.write(tmpMessage);
      }
    }    
}, 1000);

var getMessage = function() {
  return messageAsString;
}
*/


// TCP server
server.listen(PORT, HOST);
// Put a friendly message on the terminal
console.log("TCP server listening on: " + HOST + ':' + PORT);

// Express
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
