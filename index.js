var argsToArray = function(args) {
  return args = Array.prototype.slice.call(args);
};

var partial = function(fn) {
  var pastArgs = argsToArray(arguments).slice(1);
  return function() {
    var newArgs = argsToArray(arguments);
    return fn.apply(null, pastArgs.concat(newArgs));
  }
};

var hasId = function(elem) {
  return elem.hasAttribute('id') && elem.id !== '';
};

var sameNodeName = function(nodeA, nodeB) {
  return nodeA.nodeName === nodeB.nodeName;
};

var isRootNode = function(elem) {
  return elem.nodeName.toLowerCase() === 'html';
};

var getSameTagChildNodes = function(children, elem) {
  return [].filter.call(children, partial(sameNodeName, elem));
};

var getDomPath = function(actualNode) {
  if (isRootNode(actualNode)) {
    return [];
  }

  var nodeData = {
    tag: actualNode.nodeName.toLowerCase()
  };

  if (hasId(actualNode)) {
    nodeData.id = actualNode.id;
  } else {
    var children = getSameTagChildNodes(actualNode.parentNode.childNodes, actualNode);

    if (children.length === 1) {
      nodeData.n = 0;
    } else {
      nodeData.n = children.indexOf(actualNode);
    }
  }
  return getDomPath(actualNode.parentNode).concat(nodeData);
};

var getDomElemFrom = function(path) {
  return path.reduce(function(elem, nodeData) {
    if (nodeData.id) {
      return elem.querySelector(nodeData.tag + '#' + nodeData.id);
    } else {
      return elem.querySelectorAll(nodeData.tag)[nodeData.n];
    }
  }, document);
};

CTRL_KEY = 9;

var view = {
  overlay: null,

  init: function() {
    var overlay = document.createElement('div');
    view.overlay = overlay;
    var body = document.querySelector('body');
    body.appendChild(overlay);

    var styles = {
      'zIndex': '9999',
      'position': 'fixed',
      'bottom': 0,
      'top': 0,
      'left': 0,
      'right': 0,
      'backgroundColor': 'yellow',
      'opacity': 0.1,
      'visibility': 'hidden'
    };

    Object.keys(styles).forEach(function(k) {
      overlay.style[k] = styles[k];
    });

    view.initListeners();
  },

  initListeners: function() {
    document.addEventListener('keydown', function(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      var keyCode = evt.keyCode;

      if (keyCode === CTRL_KEY) {
        view.enableClickOnOverlay();
      } else {
        store.handleKey(keyCode);
      }
    })
  },

  enableClickOnOverlay: function() {
    var listenClick = function(evt) {
      view.hideOverlay();
      var elemClicked = document.elementFromPoint(evt.clientX, evt.clientY);
      store.savePathFromElement(elemClicked);
      view.showOverlay();
      view.overlay.removeEventListener('click', listenClick);
    };

    view.showOverlay();
    view.overlay.addEventListener('click', listenClick);
  },

  showOverlay: function() {
    view.setVisibility('')
  },

  hideOverlay: function() {
    view.setVisibility('hidden');
  },

  setVisibility: function(newVisibility) {
    view.overlay.style['visibility'] = newVisibility;
  }
}


var store = {
  db: {},
  lastElemPath: null,

  handleKey: function(keyCode) {
    if (store.lastElemPath) {
      store.db[keyCode] = store.lastElemPath;
      store.lastElemPath = null;
      // why do the store references the view ? 
      view.hideOverlay();
    } else if (keyCode in store.db) {
      var path = JSON.parse(store.db[keyCode]);
      getDomElemFrom(path).click();
    }
  },

  savePathFromElement: function(elem) {
    store.lastElemPath = JSON.stringify(getDomPath(elem));
  }
};

var init = view.init

init();
