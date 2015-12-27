var RecursiveObject = require('./recursiveObject.js');
var FlatObject = require('./flatObject.js');
var FlatTreeAttribute = require('./flatTreeAttribute.js');
var BoObjectType = require('./boObjectType.js');
var modelList;
var Bo = function (_metedata) {
    this.md = _metedata;
}

Bo.prototype.getBOData = function () {
    var recursiveObjects = this.FillRecursive();
    return recursiveObjects;
}

Bo.prototype.FillRecursive = function () {
    modelList = this.md["folders"]["folders"];
    var recursiveObjects = [];
    for (var i = 0; i < modelList.length; i++) {
        var model = modelList[i];
        var parentName = model["parentName"];
        var attributes = model["attributes"];
        var measures = model["measures"];
        var filters = model["filters"];
        
        
        
        if (typeof parentName === "undefined" &&   
			((typeof attributes != "undefined" && attributes.length > 0) || 
			(typeof measures != "undefined" && measures.length > 0) || 
			(typeof filters != "undefined" && filters.length > 0))) {
            
            var modelName = model["name"].trim();
            
            var recursiveObjectHandler = new RecursiveObject();
            recursiveObjectHandler.data = modelName;
            recursiveObjectHandler.Id = modelName;
            var flatTreeAttribute = new FlatTreeAttribute(modelName, false, BoObjectType.Folder, "");
            recursiveObjectHandler.attr = flatTreeAttribute;
            
            
            var childrenObject1 = [];
            if ((typeof attributes != "undefined" && attributes.length > 0) || 
		        (typeof measures != "undefined" && measures.length > 0)) {
                childrenObject1 = this.FillChildren(model);
            }
            
            var childrenObject2 = [];
            for (var x = 0; x < modelList.length; x++) {
                var _parentName = modelList[x]["parentName"];
                if (typeof _parentName != "undefined" && (_parentName.trim() === modelName)) {
                    var childModel = modelList[x];
                    childrenObject2 = this.FillChildrenModelAndObjects(childModel);
                    childrenObject1 = childrenObject1.concat(childrenObject2);
                    break;
                }
            }
            
            recursiveObjectHandler.children = childrenObject1;
            
            recursiveObjects.push(recursiveObjectHandler);
        }
    }
    return recursiveObjects;
}

Bo.prototype.FillChildren = function (model) {
    
    var recursiveObjects = [];
    var attributes = model["attributes"];
    var measures = model["measures"];
    var filters = model["filters"];
    
    if (typeof attributes != "undefined") {
        for (var i = 0; i < attributes.length; i++) {
            var _attrib = attributes[i];
            var recursiveObject = new RecursiveObject();
            recursiveObject.data = _attrib["Name"];
            recursiveObject.Id = _attrib["Id"];
            var attrPath = "folder\\" + model["name"] + "|dimension";
            var flatTreeAttribute = new FlatTreeAttribute(_attrib["Id"], false, BoObjectType.Attribute, attrPath);
            recursiveObject.attr = flatTreeAttribute;
            recursiveObjects.push(recursiveObject);
        }
    }
    
    if (typeof measures != "undefined") {
        for (var i = 0; i < measures.length; i++) {
            var _measure = measures[i];
            var recursiveObject = new RecursiveObject();
            recursiveObject.data = _measure["Name"];
            recursiveObject.Id = _measure["Id"];
            var measPath = "folder\\" + model["name"] + "|measure";
            var flatTreeAttribute = new FlatTreeAttribute(_measure["Id"], false, BoObjectType.Measure, measPath);
            recursiveObject.attr = flatTreeAttribute;
            recursiveObjects.push(recursiveObject);
        }
    }
    
    return recursiveObjects;
}


Bo.prototype.FillChildrenModelAndObjects = function (model) {
    var recursiveObjects = [];
    var attributes = model["attributes"];
    var measures = model["measures"];
    var filters = model["filters"];
    
    if ((typeof attributes != "undefined" && attributes.length > 0) || 
		(typeof measures != "undefined" && measures.length > 0) || 
		(typeof filters != "undefined" && filters.length > 0)) {
        
        var modelName = model["name"].trim();
        var recursiveObject = new RecursiveObject();
        recursiveObject.data = modelName;
        recursiveObject.Id = modelName;
        var flatTreeAttribute = new FlatTreeAttribute(modelName, false, BoObjectType.Folder, "");
        recursiveObject.attr = flatTreeAttribute;
        
        
        var childrenObject1 = [];
        if ((typeof attributes != "undefined" && attributes.length > 0) || 
		    (typeof measures != "undefined" && measures.length > 0)) {
            childrenObject1 = this.FillChildren(model);
        }
        
        var childrenObject2 = [];
        for (var x = 0; x < modelList.length; x++) {
            var _parentName = modelList[x]["parentName"];
            if (typeof _parentName != "undefined" && (_parentName.trim() === modelName)) {
                var childModel = modelList[x];
                childrenObject2 = this.FillChildrenModelAndObjects(childModel);
                childrenObject1 = childrenObject1.concat(childrenObject2);
                break;
            }
        }
        
        recursiveObject.children = childrenObject1;
        recursiveObjects.push(recursiveObject);
    }
    
    return recursiveObjects;
}

module.exports = Bo;
