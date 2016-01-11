//var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var xml2js = require('xml2js');

var selectedObjects;
var port = process.env.port || 1337;
var app = express();
app.use(bodyParser());
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


app.use(express.static('public'));
var metadataResponse;

var userName;
var password;
var serverIP;
var cmsName;
var universeName;
var universeId;




app.get('/', function (request, response) {
    response.sendfile("views/BOT.html");
});


var bo = require('./model/bo.js');

app.post('/api/setCMS', function (request, response) {
    var data = JSON.parse(request.body.data);
    userName = data["UserName"];
    password = data["Password"];;
    serverIP = data["Server"];;
    cmsName = data["CMS"];;
    universeName = data["UnxName"];;
    universeId = data["UnxId"];
    
    var responseMsg = { Status: true, Msg: "" };
    
    if (!fs.existsSync("./UniverseMetdata/" + universeName + ".json").toString()) {
        responseMsg.Msg = "BO semantic file not found";
        responseMsg.Status = true;
    }
    
    response.send(responseMsg);
});

app.post('/api/getMD', function (request, response) {
    var jsonString = fs.readFileSync("./UniverseMetdata/" + universeName + ".json").toString();
    var jsObject = JSON.parse(jsonString);
    var boHandler = new bo(jsObject);
    var metadataResponse = boHandler.getBOData();
    response.send(metadataResponse);
});

app.get('/api/getMD2', function (request, response) {
    var boHandler = new bo(parser);
    metadataResponse = boHandler.getBOData();
    response.send(metadataResponse);
});

app.post('/api/submitBoIds', function (request, response) {
    selectedObjects = JSON.parse(request.body.data);
    response.send(true);
});

var bot = require('./model/bot.js');
app.get('/api/GetBOBJData', function (request, response) {   
    var botHandler = new bot(userName, password, serverIP, cmsName, universeId, selectedObjects);
    var res = botHandler.GetBOBJData(response);
    var _logoff = botHandler.SAPLogoff();
});


