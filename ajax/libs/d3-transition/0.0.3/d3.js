if (typeof requestAnimationFrame === "undefined") {
  requestAnimationFrame = typeof window !== "undefined"
      && (window.msRequestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.oRequestAnimationFrame)
      || function(callback) { setTimeout(callback, 17); };
}

'use strict';

function Transition(root, depth) {
  this._root = root;
  this._depth = depth;
  this._name = "__transition__";
  this._id = 0;
}
function linearIn(t) {
  return +t;
}

var k = 1 / (2 * Math.PI);

var number = function(x, defaultValue) {
  return x == null || isNaN(x) ? defaultValue : +x;
}

function elasticInOut(a, p) {
  a = Math.max(1, number(a, 1)), p = number(p, .3) * 1.5 * k; // Note: treatment differs from Penner!
  var s = p * Math.asin(1 / a);
  return function(t) {
    return a * ((t = t * 2 - 1) < 0
        ? Math.pow(2, 10 * t) * Math.sin((s - t) / p)
        : Math.pow(2, -10 * t) * Math.sin((t - s) / p) + 2) / 2;
  };
}

function elasticOut(a, p) {
  a = Math.max(1, number(a, 1)), p = number(p, .3) * k;
  var s = p * Math.asin(1 / a);
  return function(t) {
    return a * Math.pow(2, -10 * t) * Math.sin((t - s) / p) + 1;
  };
}

function elasticIn(a, p) {
  a = Math.max(1, number(a, 1)), p = number(p, .3) * k;
  var s = p * Math.asin(1 / a);
  return function(t) {
    return a * Math.pow(2, 10 * --t) * Math.sin((s - t) / p);
  };
}

function backInOut(s) {
  return s = number(s, 1.70158) * 1.525, function(t) {
    return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2;
  };
}

function backOut(s) {
  return s = number(s, 1.70158), function(t) {
    return --t * t * ((s + 1) * t + s) + 1;
  };
}

function backIn(s) {
  return s = number(s, 1.70158), function(t) {
    return t * t * ((s + 1) * t - s);
  };
}
var b1 = 4 / 11,
    b2 = 6 / 11,
    b3 = 8 / 11,
    b4 = 3 / 4,
    b5 = 9 / 11,
    b6 = 10 / 11,
    b7 = 15 / 16,
    b8 = 21 / 22,
    b9 = 63 / 64,
    b0 = 1 / b1 / b1;

function bounceOut(t) {
  return t < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
}

function bounceInOut(t) {
  return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2;
}

function bounceIn(t) {
  return 1 - bounceOut(1 - t);
}

function circleInOut(t) {
  return ((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
}

function circleOut(t) {
  return Math.sqrt(1 - --t * t);
}
function circleIn(t) {
  return 1 - Math.sqrt(1 - t * t);
}

function expInOut(t) {
  return ((t *= 2) <= 1 ? Math.pow(2, 10 * t - 10) : 2 - Math.pow(2, 10 - 10 * t)) / 2;
}

function expOut(t) {
  return 1 - Math.pow(2, -10 * t);
}
function expIn(t) {
  return Math.pow(2, 10 * t - 10);
}
var pi = Math.PI,
    halfPi = pi / 2;

function sinInOut(t) {
  return (1 - Math.cos(pi * t)) / 2;
}

function sinOut(t) {
  return Math.sin(t * halfPi);
}

function sinIn(t) {
  return 1 - Math.cos(t * halfPi);
}

function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

function cubicOut(t) {
  return --t * t * t + 1;
}
function cubicIn(t) {
  return t * t * t;
}

function quadInOut(t) {
  return ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
}

function quadOut(t) {
  return t * (2 - t);
}
function quadIn(t) {
  return t * t;
}

var standardEases = (new Map)
    .set("linear-in", linearIn)
    .set("linear-out", linearIn)
    .set("linear-in-out", linearIn)
    .set("quad-in", quadIn)
    .set("quad-out", quadOut)
    .set("quad-in-out", quadInOut)
    .set("cubic-in", cubicIn)
    .set("cubic-out", cubicOut)
    .set("cubic-in-out", cubicInOut)
    .set("poly-in", cubicIn)
    .set("poly-out", cubicOut)
    .set("poly-in-out", cubicInOut)
    .set("sin-in", sinIn)
    .set("sin-out", sinOut)
    .set("sin-in-out", sinInOut)
    .set("exp-in", expIn)
    .set("exp-out", expOut)
    .set("exp-in-out", expInOut)
    .set("circle-in", circleIn)
    .set("circle-out", circleOut)
    .set("circle-in-out", circleInOut)
    .set("bounce-in", bounceIn)
    .set("bounce-out", bounceOut)
    .set("bounce-in-out", bounceInOut)
    .set("back-in", backIn())
    .set("back-out", backOut())
    .set("back-in-out", backInOut())
    .set("elastic-in", elasticIn())
    .set("elastic-out", elasticOut())
    .set("elastic-in-out", elasticInOut());

function polyInOut(e) {
  return e = number(e, 3), function(t) {
    return ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;
  };
}

function polyOut(e) {
  return e = number(e, 3), function(t) {
    return 1 - Math.pow(1 - t, e);
  };
}

function polyIn(e) {
  return e = number(e, 3), function(t) {
    return Math.pow(t, e);
  };
}

var customEases = (new Map)
    .set("poly-in", polyIn)
    .set("poly-out", polyOut)
    .set("poly-in-out", polyInOut)
    .set("back-in", backIn)
    .set("back-out", backOut)
    .set("back-in-out", backInOut)
    .set("elastic-in", elasticIn)
    .set("elastic-out", elasticOut)
    .set("elastic-in-out", elasticInOut);

var ease = function(type, a, b) {
  var i = (type += "").indexOf("-");
  if (i < 0) type += "-in";
  return arguments.length > 1 && customEases.has(type)
      ? customEases.get(type)(a, b)
      : standardEases.get(type) || linearIn;
}

var transition_ease = function(type, a, b) {
  var e = typeof type === "function" ? type : ease(type, a, b);
  return this.each(function() {
    // TODO
  });
}

function transition() {
  return new Transition([document.documentElement], 1);
}

Transition.prototype = transition.prototype = {
  ease: transition_ease
};

var selection_transition = function() {
  return new Transition(this._root, this._depth);
}// When depth = 1, root = [Node, …].
// When depth = 2, root = [[Node, …], …].
// When depth = 3, root = [[[Node, …], …], …]. etc.
// Note that [Node, …] and NodeList are used interchangeably; see arrayify.

function Selection(root, depth) {
  this._root = root;
  this._depth = depth;
  this._enter = this._update = this._exit = null;
}
var defaultView = function(node) {
  return node
      && ((node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView); // node is a Document
}

function dispatchEvent(node, type, params) {
  var window = defaultView(node),
      event = window.CustomEvent;

  if (event) {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }

  node.dispatchEvent(event);
}

var selection_dispatch = function(type, params) {

  function dispatchConstant() {
    return dispatchEvent(this, type, params);
  }

  function dispatchFunction() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  }

  return this.each(typeof params === "function" ? dispatchFunction : dispatchConstant);
}

function noop() {}
var requoteRe = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

var requote = function(string) {
  return string.replace(requoteRe, "\\$&");
}

function filterListenerOf(listener) {
  return function(event) {
    var related = event.relatedTarget;
    if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
      listener(event);
    }
  };
}

var event = null;

function listenerOf(listener, ancestors, args) {
  return function(event1) {
    var i = ancestors.length, event0 = event; // Events can be reentrant (e.g., focus).
    while (--i >= 0) args[i << 1] = ancestors[i].__data__;
    event = event1;
    try {
      listener.apply(ancestors[0], args);
    } finally {
      event = event0;
    }
  };
}

var filterEvents = new Map;

var selection_event = function(type, listener, capture) {
  var n = arguments.length,
      key = "__on" + type,
      filter,
      root = this._root;

  if (n < 2) return (n = this.node()[key]) && n._listener;

  if (n < 3) capture = false;
  if ((n = type.indexOf(".")) > 0) type = type.slice(0, n);
  if (filter = filterEvents.has(type)) type = filterEvents.get(type);

  function add() {
    var ancestor = root, i = arguments.length >> 1, ancestors = new Array(i);
    while (--i >= 0) ancestor = ancestor[arguments[(i << 1) + 1]], ancestors[i] = i ? ancestor._parent : ancestor;
    var l = listenerOf(listener, ancestors, arguments);
    if (filter) l = filterListenerOf(l);
    remove.call(this);
    this.addEventListener(type, this[key] = l, l._capture = capture);
    l._listener = listener;
  }

  function remove() {
    var l = this[key];
    if (l) {
      this.removeEventListener(type, l, l._capture);
      delete this[key];
    }
  }

  function removeAll() {
    var re = new RegExp("^__on([^.]+)" + requote(type) + "$"), match;
    for (var name in this) {
      if (match = name.match(re)) {
        var l = this[name];
        this.removeEventListener(match[1], l, l._capture);
        delete this[name];
      }
    }
  }

  return this.each(listener
      ? (n ? add : noop) // Attempt to add untyped listener is ignored.
      : (n ? remove : removeAll));
}
var selection_datum = function(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
var selection_remove = function() {
  return this.each(function() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  });
}
var selectorOf = function(selector) {
  return function() {
    return this.querySelector(selector);
  };
}
var namespaces = (new Map)
    .set("svg", "http://www.w3.org/2000/svg")
    .set("xhtml", "http://www.w3.org/1999/xhtml")
    .set("xlink", "http://www.w3.org/1999/xlink")
    .set("xml", "http://www.w3.org/XML/1998/namespace")
    .set("xmlns", "http://www.w3.org/2000/xmlns/");

var namespace = function(name) {
  var i = name.indexOf(":"), prefix = name;
  if (i >= 0) prefix = name.slice(0, i), name = name.slice(i + 1);
  return namespaces.has(prefix) ? {space: namespaces.get(prefix), local: name} : name;
}

function creatorOf(name) {
  name = namespace(name);

  function creator() {
    var document = this.ownerDocument,
        uri = this.namespaceURI;
    return uri
        ? document.createElementNS(uri, name)
        : document.createElement(name);
  }

  function creatorNS() {
    return this.ownerDocument.createElementNS(name.space, name.local);
  }

  return name.local ? creatorNS : creator;
}

var selection_append = function(creator, selector) {
  if (typeof creator !== "function") creator = creatorOf(creator);

  function append() {
    return this.appendChild(creator.apply(this, arguments));
  }

  function insert() {
    return this.insertBefore(creator.apply(this, arguments), selector.apply(this, arguments) || null);
  }

  return this.select(arguments.length < 2
      ? append
      : (typeof selector !== "function" && (selector = selectorOf(selector)), insert));
}
var selection_html = function(value) {
  if (!arguments.length) return this.node().innerHTML;

  function setConstant() {
    this.innerHTML = value;
  }

  function setFunction() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  }

  if (value == null) value = "";

  return this.each(typeof value === "function" ? setFunction : setConstant);
}
var selection_text = function(value) {
  if (!arguments.length) return this.node().textContent;

  function setConstant() {
    this.textContent = value;
  }

  function setFunction() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  }

  if (value == null) value = "";

  return this.each(typeof value === "function" ? setFunction : setConstant);
}

function collapse(string) {
  return string.trim().replace(/\s+/g, " ");
}

function classerOf(name) {
  var re;
  return function(node, value) {
    if (c = node.classList) return value ? c.add(name) : c.remove(name);
    if (!re) re = new RegExp("(?:^|\\s+)" + requote(name) + "(?:\\s+|$)", "g");
    var c = node.getAttribute("class") || "";
    if (value) {
      re.lastIndex = 0;
      if (!re.test(c)) node.setAttribute("class", collapse(c + " " + name));
    } else {
      node.setAttribute("class", collapse(c.replace(re, " ")));
    }
  };
}

var selection_class = function(name, value) {
  name = (name + "").trim().split(/^|\s+/);
  var n = name.length;

  if (arguments.length < 2) {
    var node = this.node(), i = -1;
    if (value = node.classList) { // SVG elements may not support DOMTokenList!
      while (++i < n) if (!value.contains(name[i])) return false;
    } else {
      value = node.getAttribute("class");
      while (++i < n) if (!classedRe(name[i]).test(value)) return false;
    }
    return true;
  }

  name = name.map(classerOf);

  function setConstant() {
    var i = -1;
    while (++i < n) name[i](this, value);
  }

  function setFunction() {
    var i = -1, x = value.apply(this, arguments);
    while (++i < n) name[i](this, x);
  }

  return this.each(typeof value === "function" ? setFunction : setConstant);
}
var selection_property = function(name, value) {
  if (arguments.length < 2) return this.node()[name];

  function remove() {
    delete this[name];
  }

  function setConstant() {
    this[name] = value;
  }

  function setFunction() {
    var x = value.apply(this, arguments);
    if (x == null) delete this[name];
    else this[name] = x;
  }

  return this.each(value == null ? remove : typeof value === "function" ? setFunction : setConstant);
}

var selection_style = function(name, value, priority) {
  var n = arguments.length;

  if (n < 2) return defaultView(n = this.node()).getComputedStyle(n, null).getPropertyValue(name);

  if (n < 3) priority = "";

  function remove() {
    this.style.removeProperty(name);
  }

  function setConstant() {
    this.style.setProperty(name, value, priority);
  }

  function setFunction() {
    var x = value.apply(this, arguments);
    if (x == null) this.style.removeProperty(name);
    else this.style.setProperty(name, x, priority);
  }

  return this.each(value == null ? remove : typeof value === "function" ? setFunction : setConstant);
}

var selection_attr = function(name, value) {
  name = namespace(name);

  if (arguments.length < 2) {
    var node = this.node();
    return name.local
        ? node.getAttributeNS(name.space, name.local)
        : node.getAttribute(name);
  }

  function remove() {
    this.removeAttribute(name);
  }

  function removeNS() {
    this.removeAttributeNS(name.space, name.local);
  }

  function setConstant() {
    this.setAttribute(name, value);
  }

  function setConstantNS() {
    this.setAttributeNS(name.space, name.local, value);
  }

  function setFunction() {
    var x = value.apply(this, arguments);
    if (x == null) this.removeAttribute(name);
    else this.setAttribute(name, x);
  }

  function setFunctionNS() {
    var x = value.apply(this, arguments);
    if (x == null) this.removeAttributeNS(name.space, name.local);
    else this.setAttributeNS(name.space, name.local, x);
  }

  return this.each(value == null
      ? (name.local ? removeNS : remove)
      : (typeof value === "function"
          ? (name.local ? setFunctionNS : setFunction)
          : (name.local ? setConstantNS : setConstant)));
}
var selection_each = function(callback) {
  var depth = this._depth,
      stack = new Array(depth);

  function visit(nodes, depth) {
    var i = -1,
        n = nodes.length,
        node;

    if (--depth) {
      var stack0 = depth * 2,
          stack1 = stack0 + 1;
      while (++i < n) {
        if (node = nodes[i]) {
          stack[stack0] = node._parent.__data__, stack[stack1] = i;
          visit(node, depth);
        }
      }
    }

    else {
      while (++i < n) {
        if (node = nodes[i]) {
          stack[0] = node.__data__, stack[1] = i;
          callback.apply(node, stack);
        }
      }
    }
  }

  visit(this._root, depth);
  return this;
}
var selection_empty = function() {
  return !this.node();
}
var selection_size = function() {
  var size = 0;
  this.each(function() { ++size; });
  return size;
}

function firstNode(nodes, depth) {
  var i = -1,
      n = nodes.length,
      node;

  if (--depth) {
    while (++i < n) {
      if (node = nodes[i]) {
        if (node = firstNode(node, depth)) {
          return node;
        }
      }
    }
  }

  else {
    while (++i < n) {
      if (node = nodes[i]) {
        return node;
      }
    }
  }
}
var selection_node = function() {
  return firstNode(this._root, this._depth);
}
var selection_nodes = function() {
  var nodes = new Array(this.size()), i = -1;
  this.each(function() { nodes[++i] = this; });
  return nodes;
}
var selection_call = function() {
  var callback = arguments[0];
  callback.apply(arguments[0] = this, arguments);
  return this;
}

function arrayifyNode(nodes, depth) {
  var i = -1,
      n = nodes.length,
      node;

  if (--depth) {
    while (++i < n) {
      if (node = nodes[i]) {
        nodes[i] = arrayifyNode(node, depth);
      }
    }
  }

  else if (!Array.isArray(nodes)) {
    var array = new Array(n);
    while (++i < n) array[i] = nodes[i];
    array._parent = nodes._parent;
    nodes = array;
  }

  return nodes;
}// The leaf groups of the selection hierarchy are initially NodeList,
// and then lazily converted to arrays when mutation is required.
var arrayify = function(selection) {
  return selection._root = arrayifyNode(selection._root, selection._depth);
}

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

var selection_sort = function(comparator) {
  if (!comparator) comparator = ascending;

  function compare(a, b) {
    return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
  }

  function visit(nodes, depth) {
    if (--depth) {
      var i = -1,
          n = nodes.length,
          node;
      while (++i < n) {
        if (node = nodes[i]) {
          visit(node, depth);
        }
      }
    }

    else {
      nodes.sort(compare);
    }
  }

  visit(arrayify(this), this._depth);
  return this.order();
}

function orderNode(nodes, depth) {
  var i = nodes.length,
      node,
      next;

  if (--depth) {
    while (--i >= 0) {
      if (node = nodes[i]) {
        orderNode(node, depth);
      }
    }
  }

  else {
    next = nodes[--i];
    while (--i >= 0) {
      if (node = nodes[i]) {
        if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
}
var selection_order = function() {
  orderNode(this._root, this._depth);
  return this;
}

function emptyNode(nodes, depth) {
  var i = -1,
      n = nodes.length,
      node,
      empty = new Array(n);

  if (--depth) {
    while (++i < n) {
      if (node = nodes[i]) {
        empty[i] = emptyNode(node, depth);
      }
    }
  }

  empty._parent = nodes._parent;
  return empty;
}

var emptyOf = function(selection) {
  return new Selection(emptyNode(arrayify(selection), selection._depth), selection._depth);
}// Lazily constructs the exit selection for this (update) selection.
// Until this selection is joined to data, the exit selection will be empty.

var selection_exit = function() {
  return this._exit || (this._exit = emptyOf(this));
}// Lazily constructs the enter selection for this (update) selection.
// Until this selection is joined to data, the enter selection will be empty.

var selection_enter = function() {
  if (!this._enter) {
    this._enter = emptyOf(this);
    this._enter._update = this;
  }
  return this._enter;
}

function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}

EnterNode.prototype = {
  appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
  insertBefore: function(child, next) { return this._parent.insertBefore(child, next || this._next); }
};

function valueOf_(value) { // XXX https://github.com/rollup/rollup/issues/12
  return function() {
    return value;
  };
}// The value may either be an array or a function that returns an array.
// An optional key function may be specified to control how data is bound;
// if no key function is specified, data is bound to nodes by index.
// Or, if no arguments are specified, this method returns all bound data.
var selection_data = function(value, key) {
  if (!value) {
    var data = new Array(this.size()), i = -1;
    this.each(function(d) { data[++i] = d; });
    return data;
  }

  var depth = this._depth - 1,
      stack = new Array(depth * 2),
      bind = key ? bindKey : bindIndex;

  if (typeof value !== "function") value = valueOf_(value);
  visit(this._root, this.enter()._root, this.exit()._root, depth);

  function visit(update, enter, exit, depth) {
    var i = -1,
        n,
        node;

    if (depth--) {
      var stack0 = depth * 2,
          stack1 = stack0 + 1;

      n = update.length;

      while (++i < n) {
        if (node = update[i]) {
          stack[stack0] = node._parent.__data__, stack[stack1] = i;
          visit(node, enter[i], exit[i], depth);
        }
      }
    }

    else {
      var j = 0,
          before;

      bind(update, enter, exit, value.apply(update._parent, stack));
      n = update.length;

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      while (++i < n) {
        if (before = enter[i]) {
          if (i >= j) j = i + 1;
          while (!(node = update[j]) && ++j < n);
          before._next = node || null;
        }
      }
    }
  }

  function bindIndex(update, enter, exit, data) {
    var i = 0,
        node,
        nodeLength = update.length,
        dataLength = data.length,
        minLength = Math.min(nodeLength, dataLength);

    // Clear the enter and exit arrays, and then initialize to the new length.
    enter.length = 0, enter.length = dataLength;
    exit.length = 0, exit.length = nodeLength;

    for (; i < minLength; ++i) {
      if (node = update[i]) {
        node.__data__ = data[i];
      } else {
        enter[i] = new EnterNode(update._parent, data[i]);
      }
    }

    // Note: we don’t need to delete update[i] here because this loop only
    // runs when the data length is greater than the node length.
    for (; i < dataLength; ++i) {
      enter[i] = new EnterNode(update._parent, data[i]);
    }

    // Note: and, we don’t need to delete update[i] here because immediately
    // following this loop we set the update length to data length.
    for (; i < nodeLength; ++i) {
      if (node = update[i]) {
        exit[i] = update[i];
      }
    }

    update.length = dataLength;
  }

  function bindKey(update, enter, exit, data) {
    var i,
        node,
        dataLength = data.length,
        nodeLength = update.length,
        nodeByKeyValue = new Map,
        keyStack = new Array(2).concat(stack),
        keyValues = new Array(nodeLength),
        keyValue;

    // Clear the enter and exit arrays, and then initialize to the new length.
    enter.length = 0, enter.length = dataLength;
    exit.length = 0, exit.length = nodeLength;

    // Compute the keys for each node.
    for (i = 0; i < nodeLength; ++i) {
      if (node = update[i]) {
        keyStack[0] = node.__data__, keyStack[1] = i;
        keyValues[i] = keyValue = key.apply(node, keyStack);

        // Is this a duplicate of a key we’ve previously seen?
        // If so, this node is moved to the exit selection.
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        }

        // Otherwise, record the mapping from key to node.
        else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }

    // Now clear the update array and initialize to the new length.
    update.length = 0, update.length = dataLength;

    // Compute the keys for each datum.
    for (i = 0; i < dataLength; ++i) {
      keyStack[0] = data[i], keyStack[1] = i;
      keyValue = key.apply(update._parent, keyStack);

      // Is there a node associated with this key?
      // If not, this datum is added to the enter selection.
      if (!(node = nodeByKeyValue.get(keyValue))) {
        enter[i] = new EnterNode(update._parent, data[i]);
      }

      // Did we already bind a node using this key? (Or is a duplicate?)
      // If unique, the node and datum are joined in the update selection.
      // Otherwise, the datum is ignored, neither entering nor exiting.
      else if (node !== true) {
        update[i] = node;
        node.__data__ = data[i];
      }

      // Record that we consumed this key, either to enter or update.
      nodeByKeyValue.set(keyValue, true);
    }

    // Take any remaining nodes that were not bound to data,
    // and place them in the exit selection.
    for (i = 0; i < nodeLength; ++i) {
      if ((node = nodeByKeyValue.get(keyValues[i])) !== true) {
        exit[i] = node;
      }
    }
  }

  return this;
}

var filterOf = function(selector) {
  return function() {
    return this.matches(selector);
  };
};

if (typeof document !== "undefined") {
  var element = document.documentElement;
  if (!element.matches) {
    var vendorMatches = element.webkitMatchesSelector || element.msMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector;
    filterOf = function(selector) { return function() { return vendorMatches.call(this, selector); }; };
  }
}// The filter may either be a selector string (e.g., ".foo")
// or a function that returns a boolean.

var selection_filter = function(filter) {
  var depth = this._depth,
      stack = new Array(depth * 2);

  if (typeof filter !== "function") filter = filterOf(filter);

  function visit(nodes, depth) {
    var i = -1,
        n = nodes.length,
        node,
        subnodes;

    if (--depth) {
      var stack0 = depth * 2,
          stack1 = stack0 + 1;
      subnodes = new Array(n);
      while (++i < n) {
        if (node = nodes[i]) {
          stack[stack0] = node._parent.__data__, stack[stack1] = i;
          subnodes[i] = visit(node, depth);
        }
      }
    }

    // The filter operation does not preserve the original index,
    // so the resulting leaf groups are dense (not sparse).
    else {
      subnodes = [];
      while (++i < n) {
        if (node = nodes[i]) {
          stack[0] = node.__data__, stack[1] = i;
          if (filter.apply(node, stack)) {
            subnodes.push(node);
          }
        }
      }
    }

    subnodes._parent = nodes._parent;
    return subnodes;
  }

  return new Selection(visit(this._root, depth), depth);
}

function selectorAllOf(selector) {
  return function() {
    return this.querySelectorAll(selector);
  };
}// The selector may either be a selector string (e.g., ".foo")
// or a function that optionally returns an array of nodes to select.
// This is the only operation that increases the depth of a selection.

var selection_selectAll = function(selector) {
  var depth = this._depth,
      stack = new Array(depth * 2);

  if (typeof selector !== "function") selector = selectorAllOf(selector);

  function visit(nodes, depth) {
    var i = -1,
        n = nodes.length,
        node,
        subnode,
        subnodes = new Array(n);

    if (--depth) {
      var stack0 = depth * 2,
          stack1 = stack0 + 1;
      while (++i < n) {
        if (node = nodes[i]) {
          stack[stack0] = node._parent.__data__, stack[stack1] = i;
          subnodes[i] = visit(node, depth);
        }
      }
    }

    // Data is not propagated since there is a one-to-many mapping.
    // The parent of the new leaf group is the old node.
    else {
      while (++i < n) {
        if (node = nodes[i]) {
          stack[0] = node.__data__, stack[1] = i;
          subnodes[i] = subnode = selector.apply(node, stack);
          subnode._parent = node;
        }
      }
    }

    subnodes._parent = nodes._parent;
    return subnodes;
  }

  return new Selection(visit(this._root, depth), depth + 1);
}// The selector may either be a selector string (e.g., ".foo")
// or a function that optionally returns the node to select.

var selection_select = function(selector) {
  var depth = this._depth,
      stack = new Array(depth * 2);

  if (typeof selector !== "function") selector = selectorOf(selector);

  function visit(nodes, update, depth) {
    var i = -1,
        n = nodes.length,
        node,
        subnode,
        subnodes = new Array(n);

    if (--depth) {
      var stack0 = depth * 2,
          stack1 = stack0 + 1;
      while (++i < n) {
        if (node = nodes[i]) {
          stack[stack0] = node._parent.__data__, stack[stack1] = i;
          subnodes[i] = visit(node, update && update[i], depth);
        }
      }
    }

    // The leaf group may be sparse if the selector returns a falsey value;
    // this preserves the index of nodes (unlike selection.filter).
    // Propagate data to the new node only if it is defined on the old.
    // If this is an enter selection, materialized nodes are moved to update.
    else {
      while (++i < n) {
        if (node = nodes[i]) {
          stack[0] = node.__data__, stack[1] = i;
          if (subnode = selector.apply(node, stack)) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            if (update) update[i] = subnode, delete nodes[i];
            subnodes[i] = subnode;
          }
        }
      }
    }

    subnodes._parent = nodes._parent;
    return subnodes;
  }

  return new Selection(visit(this._root, this._update && this._update._root, depth), depth);
}

Selection.prototype = selection.prototype = {
  select: selection_select,
  selectAll: selection_selectAll,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  class: selection_class,
  classed: selection_class, // deprecated alias
  text: selection_text,
  html: selection_html,
  append: selection_append,
  insert: selection_append, // deprecated alias
  remove: selection_remove,
  datum: selection_datum,
  event: selection_event,
  on: selection_event, // deprecated alias
  dispatch: selection_dispatch
};

function selection() {
  return new Selection([document.documentElement], 1);
}

selection.prototype.transition = selection_transition;

var queueHead,
    queueTail,
    interval, // is an interval (or frame) active?
    timeout; // is a timeout active?

function step() {
  var delay = flush();
  if (delay > 24) {
    if (isFinite(delay)) {
      clearTimeout(timeout);
      timeout = setTimeout(step, delay);
    }
    interval = 0;
  } else {
    interval = 1;
    requestAnimationFrame(step);
  }
}

function Timer(callback, time) {
  this.callback = callback;
  this.time = time;
  this.flush = false;
  this.next = null;
}// The timer will continue to fire until callback returns true.

var timer = function(callback, delay, then) {
  if (delay == null) delay = 0;
  if (then == null) then = Date.now();

  // Add the callback to the tail of the queue.
  var timer = new Timer(callback, then + delay);
  if (queueTail) queueTail.next = timer;
  else queueHead = timer;
  queueTail = timer;

  // Start animatin’!
  if (!interval) {
    timeout = clearTimeout(timeout);
    interval = 1;
    requestAnimationFrame(step);
  }
}// The active timer is exposed so that the callback and time can be modified
// by transitions, but this isn’t intended to be public.

var active;// Execute all eligible timers,
// then flush completed timers to avoid concurrent queue modification.
// Returns the delay until the nextmost active timer.

function flush() {
  var t0,
      t1 = queueHead,
      time = Infinity,
      now = Date.now();

  active = queueHead;
  while (active) {
    if (now >= active.time) active.flush = active.callback(now - active.time);
    active = active.next;
  }

  while (t1) {
    if (t1.flush) {
      t1 = t0 ? t0.next = t1.next : queueHead = t1.next;
    } else {
      if (t1.time < time) time = t1.time;
      t1 = (t0 = t1).next;
    }
  }

  queueTail = t0;
  return time - now;
}

var bug44083 = typeof navigator !== "undefined" && /WebKit/.test(navigator.userAgent) ? -1 : 0; // https://bugs.webkit.org/show_bug.cgi?id=44083

var select = function(selector) {
  return new Selection([typeof selector === "string" ? document.querySelector(selector) : selector], 1);
}

var point = function(node, event) {
  var svg = node.ownerSVGElement || node;
  if (svg.createSVGPoint) {
    var point = svg.createSVGPoint();
    if (bug44083 < 0) {
      var window = defaultView(node);
      if (window.scrollX || window.scrollY) {
        svg = select(window.document.body).append("svg").style({position: "absolute", top: 0, left: 0, margin: 0, padding: 0, border: "none"}, "important");
        var ctm = svg.node().getScreenCTM();
        bug44083 = !(ctm.f || ctm.e);
        svg.remove();
      }
    }
    if (bug44083) point.x = event.pageX, point.y = event.pageY;
    else point.x = event.clientX, point.y = event.clientY;
    point = point.matrixTransform(node.getScreenCTM().inverse());
    return [point.x, point.y];
  }
  var rect = node.getBoundingClientRect();
  return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
}

var sourceEvent = function() {
  var current = event, source;
  while (source = current.sourceEvent) current = source;
  return current;
}

var touches = function(node, touches) {
  if (arguments.length < 2) touches = sourceEvent().touches;
  for (var i = 0, n = touches ? touches.length : 0, points = new Array(n); i < n; ++i) {
    points[i] = point(node, touches[i]);
  }
  return points;
}

var touch = function(node, touches, identifier) {
  if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;
  for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
    if ((touch = touches[i]).identifier === identifier) {
      return point(node, touch);
    }
  }
  return null;
}

var selectAll = function(selector) {
  return new Selection(typeof selector === "string" ? document.querySelectorAll(selector) : selector, 1);
}

var mouse = function(node, event) {
  if (arguments.length < 2) event = sourceEvent();
  if (event.changedTouches) event = event.changedTouches[0];
  return point(node, event);
}

var d3 = {
  get event() { return event; },
  mouse: mouse,
  namespace: namespace,
  namespaces: namespaces,
  requote: requote,
  select: select,
  selectAll: selectAll,
  selection: selection,
  touch: touch,
  touches: touches,
  timer: timer,
  timerFlush: flush,
  transition: transition
};

module.exports = d3;