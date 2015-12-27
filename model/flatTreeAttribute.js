var FlatTreeAttribute = function (id, selected, type, path) {
    this.Id = id;
    this.selected = selected;
    this.type = type;
    this.path = path;
}

var ObjType =
 {
    Folder : 0,
    Attribute : 1,
    Measure : 2,
    Filter: 3
}

module.exports = FlatTreeAttribute;