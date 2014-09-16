// ---------------- Dependencies --------------
var express = require('express');
var routes = require('./routes');
var pdfGenerator = require('./routes/PdfGenerator');
var attdownload = require('./routes/AttDownloader');
var main = require('./routes/main');
var http = require('http');
var path = require('path');

var app = express();

// -------------- environments --------------
app.use(express.cookieParser('very secret'));
app.use(express.session());
app.set('port', process.env.PORT || 3300);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// ---------------development only---------------------
if ('development' == app.get('env')) {
  app.use(express.errorHandler({secret: '1234567890QWERTY'}));
}

//---------------- navigation ----------
app.get('/api', pdfGenerator.returnJSON);
app.post('/pdf', pdfGenerator.renderPDF);
app.post('/process', main.process);
app.post('/att', attdownload.attachmentDownload);
app.get('/', routes.index);

//----------------- start server -------------------------
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});