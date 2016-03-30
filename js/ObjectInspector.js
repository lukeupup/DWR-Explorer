function ObjectInspector($tree, obj) {
  this._$tree = $tree;
  this._obj = obj;
  this._id = 0;
  this._status = {};
  this._objCache = {};
  this.init();
}
ObjectInspector.prototype.init = function() {
  var me = this;
  this._$tree.bind('tree.click', function(event) {
    var node = event.node;
    if (me._status[node.id] === 'TO_OPEN') {
      var obj = me._objCache[node.id];
      if (me.hasSubNodes(obj)) {
        var subNodes = me.format(me._objCache[node.id]);
        for (var i = 0; i < subNodes.length; ++i) {
          me._$tree.tree('appendNode', subNodes[i], node);
        }
        me._status[node.id] = 'DONE';
      }
    }
    me._$tree.tree('toggle', node);
  });
};
ObjectInspector.prototype.show = function() {
  var children = [];
  var label = '';
  if (this.hasSubNodes(this._obj)) {
    children = this.format(this._obj);
    if ($.isPlainObject(this._obj)) {
      label = 'Object';
    } else if ($.isArray(this._obj)) {
      label = 'Array[' + this._obj.length + ']';
    }
  } else {
    if (typeof this._obj === 'string') {
      label = '"' + this._obj + '"';
    } else {
      label = String(this._obj);
    }
  }
  this._$tree.tree({
    data: [{
      label: label, 
      id: this.getId(),
      children: children
    }],
    autoOpen: true
  });
};
ObjectInspector.prototype.getId = function() {
  this._id++;
  return this._id;
};
ObjectInspector.prototype.hasSubNodes = function(obj) {
  return $.isPlainObject(obj) || $.isArray(obj);
};
ObjectInspector.prototype.createLabel = function(obj, prop) {
  if (!this.hasSubNodes(obj[prop])) {
    var valueStr;
    if (typeof obj[prop] === 'string') {
      valueStr = '"' + obj[prop] + '"';
    } else {
      valueStr = obj[prop];
    }
    return prop.toString() + ': ' + valueStr;
  } else {
    if ($.isPlainObject(obj[prop])) {
      return prop.toString() + ': Object';
    }
    if ($.isArray(obj[prop])) {
      return prop.toString() + ': Array[' + obj[prop].length + ']';
    }
  }
};
ObjectInspector.prototype.format = function(obj) {
  var me = this;
  var propArr = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var id = this.getId();
      var childNode = {
        label: me.createLabel(obj, prop),
        id: id
      };
      // if ($.isPlainObject(obj[prop])) {
      // } else if ($.isArray(obj[prop])) {
      // }
      propArr.push(childNode);
      me._status[id] = 'TO_OPEN';
      me._objCache[id] = obj[prop];
    }
  }
  return propArr;
};
