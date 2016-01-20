var _ = require("underscore");

var BO_OBJECT_TYPE =
{
    Folder : 0,
    Attribute : 1,
    Measure : 2,
    Filter: 3
}

module.exports = {
    getBOData: function (metadata) {
        return generateFolderTree(metadata["folders"]["folders"]);
    }
}

var generateFolderTree = function (folders) {
    var folderTree = [];
    for (var i in folders) {
        var folder = folders[i];
        //If the folder is top-level(having no parent) folder we generate the corresponding tree
        if (_.isUndefined(folder["parentName"])) {
            folderTree.push(createFolderStructure(folders, folder))
        }
    }
    return folderTree;
}

var createFolderStructure = function(folders, root) {
    var attributes = root["attributes"];
    var measures = root["measures"];
    var name = root["name"].trim();

    if (!_.isEmpty(attributes) || !_.isEmpty(measures)) {
        var folderObject = {
            Id: name,
            data: name,
            attr: {
                Id: name,
                selected: false,
                type: BO_OBJECT_TYPE.Folder,
                path: ""
            }
        }
        var children = [];
        children = children.concat(addAttributeChildren(name, attributes));
        children = children.concat(addMeasureChildren(name, measures));

        //We're going to find the children of folder and continue generating structure recursively
        for (var i in folders) {
            var model = folders[i];
            if (_.isString(model["parentName"]) && model["parentName"].trim() === name) {
                children = children.concat(createFolderStructure(folders, model));
                break;
            }
        }
        folderObject.children = children;
    }
    return folderObject;
}

var addAttributeChildren = function (name, attributes) {
    var children = [];
    if (_.isArray(attributes)) {
        for (var i in attributes) {
            var attribute = createFolderPropertyObject(attributes[i]);
            attribute.attr.path = "folder\\" + name + "|dimension";
            attribute.attr.type = BO_OBJECT_TYPE.Attribute;
            children.push(attribute);
        }
    }
    return children;
}

var addMeasureChildren = function (name, measures) {
    var children = [];
    if (_.isArray(measures)) {
        for (var i in measures) {
            var measure = createFolderPropertyObject(measures[i]);
            measure.attr.path = "folder\\" + name + "|measure";
            measure.attr.type = BO_OBJECT_TYPE.Measure;
            children.push(measure);
        }
    }
    return children;
}

var createFolderPropertyObject = function (property) {
    return {
        Id: property["Id"],
        data: property["Name"],
        children: [],
        attr: {
            Id: property["Id"],
            selected: false,
            type: undefined,
            path: undefined
        }
    }
}
