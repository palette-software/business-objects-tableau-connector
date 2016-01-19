var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var xml2js = require('xml2js');
var bot = require('./model/bot.js');
var bo = require('./model/bo.js');
var log4js = require('log4js');
var log = log4js.getLogger("Web server");
log.setLevel("DEBUG");

var port = process.env.port || process.argv[2] || 1338 ;

var app = express();
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto', format: ':method :url'}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static('public'));
app.listen(port);

//-------------------------------------------------------------------
//Remove below comments in case you want to enable cross domain call
//And give the URL of domain from where you are expecting the call.
//-------------------------------------------------------------------

//var allowCrossDomain = function (req, res, next) {
//    res.header('Access-Control-Allow-Origin', 'http://amit-pc:8000');
//    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//    res.header('Access-Control-Allow-Headers', 'Content-Type');
//    next();
//}
//app.use(allowCrossDomain);

var selectedObjects;
var userName;
var password;
var serverIP;
var cmsName;
var universeName;
var universeId;




app.get('/', function (request, response) {
    response.sendfile("views/BOT.html");
});

app.post('/api/cms', function (req, res) {
    userName = req.body["UserName"];
    password = req.body["Password"];
    serverIP = req.body["Server"];
    cmsName = req.body["CMS"];
    universeName = req.body["UnxName"];
    universeId = req.body["UnxId"];

    var metadataFile = "./UniverseMetdata/" + universeName + ".json";
    fs.access(metadataFile, fs.R_OK, function(e) {
        if (!e) {
            res.sendStatus(200);
        } else {
            log.error("Couldn't access metadata file " + metadataFile);
            res.sendStatus(500);
        }
    });
});

app.get('/api/bo-metadata', function (req, response) {
    var metadataFile = "./UniverseMetdata/" + universeName + ".json";
    var universeMetadata = JSON.parse(fs.readFileSync(metadataFile));
    var boHandler = new bo(universeMetadata);
    var metadataResponse = boHandler.getBOData();
    response.json(metadataResponse);
});

app.post('/api/bo-ids', function (req, response) {
    selectedObjects = JSON.parse(req.body.data);
    response.send(true);
});

app.get('/api/bo-data', function (req, response) {
    var botHandler = new bot(userName, password, serverIP, cmsName, universeId, selectedObjects);
    var res = botHandler.GetBOBJData(response);
    var _logoff = botHandler.SAPLogoff();
});


