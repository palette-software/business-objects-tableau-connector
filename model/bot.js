var Client = require('node-rest-client').Client;
var xml2js = require('xml2js');
var client = new Client();
var parser = new xml2js.Parser();
var fs = require('fs');
var parser2 = new xml2js.Parser();


var Bot = function (userName, password, serverIP, cmsName, universeId, selectedObjects) {
    this.userName = userName;
    this.password = password;
    this.serverIP = serverIP;
    this.cmsName = cmsName;
    this.universeId = universeId;
    this.selectedObjects = selectedObjects;
    this.ltoken = "";
    this.objTemplate = "<resultObject path=\"{OBJPATH}\" id=\"{OBJID}\"/>";
    this.ltoken2 = "";
}


Bot.prototype.GetBOBJData = function (_finalCallback) {
    
    if (this.ltoken === "") {
        this.SAPToken(_finalCallback);
    }      
    
}

Bot.prototype.SAPLogoff = function () {
    if (this.ltoken != "") {
        var serverLogonURL = "http://" + this.serverIP + ":6405/biprws/logoff";
        var args = {           
            headers: { "Content-Type": "application/xml","X-SAP-LogonToken": this.ltoken }
        };

        client.get(serverLogonURL, args, function (data, response) {
            if (response.statusCode == 200) {
                this.ltoken = "";
            }
        });
    }
}

Bot.prototype.SAPToken = function (_finalCallback) {
    var h = this;
    var serverLogonURL = "http://" + this.serverIP + ":6405/biprws/logon/long";
    var strXML = "<attrs xmlns='http://www.sap.com/rws/bip/'>" +
                            "<attr name='cms' type='string'>" + this.cmsName + ":6400</attr>" +
                            "<attr name='userName' type='string'>" + this.userName + "</attr>" +
                            "<attr name='password' type='string'>" + this.password + "</attr>" +
                            "<attr name='auth' type='string' possibilities='secEnterprise,secLDAP,secWinAD'>secEnterprise</attr>" +
                            "</attrs>";
    
    
    var args = {
        data: strXML,
        headers: { "Content-Type": "application/xml" }
    };
    
    
    
    
    client.post(serverLogonURL, args, function (data, response) {
        if (response.statusCode == 200) {
            var str = String.fromCharCode.apply(null, data);
            parser.parseString(str);
            var token = parser.resultObject.entry.content[0].attrs[0].attr[0]._;
            h.ltoken2 = token;
            h.ltoken = "\"" + token + "\"";
            
            if (h.ltoken != "") {
                h.CreateAndSubmitQuery(_finalCallback);
            }
        }
    });
  
}

Bot.prototype.CreateAndSubmitQuery = function (_finalCallback) {
    var boQuery = this.CreateBOQueryXML();
    var queryId = this.SubmitBOQueryXML(boQuery, _finalCallback);
    
}


Bot.prototype.CreateBOQueryXML = function () {
    var selObjs = this.selectedObjects;
    var xmlString = fs.readFileSync("BOBJQuery.xml").toString();
    var res = xmlString.replace("{UNX_ID}", this.universeId);
    var selectedObjString = "";
    for (var i = 0; i < selObjs.length; i++) {
        selectedObjString += this.objTemplate.replace("{OBJID}", selObjs[i].Id).replace("{OBJPATH}", selObjs[i].Path);
    }
    res = res.replace("{OBJECTS}", selectedObjString);
    return res;
}

Bot.prototype.SubmitBOQueryXML = function (bobjQuery, _finalCallback) {
    var h = this;
    
    var serverQueryURL = "http://" + this.serverIP + ":6405/biprws/sl/v1/queries";
    var args = {
        data: bobjQuery,
        headers: { "Content-Type": "application/xml", "X-SAP-LogonToken": this.ltoken }
    };
    
    var qId;
    client.post(serverQueryURL, args, function (data, response) {
        if (response.statusCode == 200) {
            qId = data.success.id[0];
            h.GetQueryResponse(qId, _finalCallback);
        }
    });
}

Bot.prototype.GetQueryResponse = function (queryId, _finalCallback) {
    var h = this;
    var queryResultURL = "http://" + this.serverIP + ":6405/biprws/sl/v1/queries/" + queryId + "/data.svc/Flows0";
    
    
    var args = {
        headers: { "Accept": "application/json", "Content-Type": "application/json", "X-SAP-LogonToken": this.ltoken }
    };
    
    client = new Client();    
    client.get(queryResultURL, args, function (data, response) {
        if (response.statusCode == 200) {
            var sanitized= data.d.results.map(function (e) {               
                delete e.__metadata;                
                return e;
            });
            if (typeof _finalCallback !== 'undefined') {
                _finalCallback.send(sanitized);
            }
        }
    });

    //return parser2;
}




module.exports = Bot;