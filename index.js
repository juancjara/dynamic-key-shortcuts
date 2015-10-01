//http://stackoverflow.com/questions/5728558/get-the-dom-path-of-the-clicked-a/16742828#16742828
var getDomPath = function(el) {
  var stack = [];
  while ( el.parentNode != null ) {
    var sibCount = 0;
    var sibIndex = 0;
    for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
      var sib = el.parentNode.childNodes[i];
      if ( sib.nodeName == el.nodeName ) {
        if ( sib === el ) {
          sibIndex = sibCount;
        }
        sibCount++;
      }
    }
    if ( el.hasAttribute('id') && el.id != '' ) {
      stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
    } else if ( sibCount > 1 ) {
        //original
        //stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');

        //modified to get a simple structure
        stack.unshift(el.nodeName.toLowerCase() + ':' + sibIndex);
    } else {
      stack.unshift(el.nodeName.toLowerCase());
    }
    el = el.parentNode;
  }

  return stack.slice(1); // removes the html element
};
//

//not sure about the name
//transformPath
//transformToJSPath
//simplifyPath
var getEvalPath = function(pathArray) {
  var newPath = 'document.querySelectorAll("';
  for (var i = 0, len = pathArray.length; i < len ; i++) {
    if (i !== 0) {
      newPath += ' > ';
    }
    if (pathArray[i].indexOf(':') !== -1) {
      var data = pathArray[i].split(':');
      newPath += data[0] + '")[' + data[1] + ']';
      if (i + 1 < len) {
        newPath += '.querySelectorAll(":scope ';
      }
    } else {
       newPath += pathArray[i];
    }
  }

  if (newPath.slice(-1) !== ']') {
    newPath += '")[0]';
  }
  return newPath;
};

var viewUtils = {
  styleElem: function(elem, prop, value) {
    elem.style[prop] = value;
  }
};

var view = {
  CTRL_KEY: 9,
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
      view.styleOverlay(k, styles[k]);
    });

    view.initListeners();
  },

  initListeners: function() {
    document.addEventListener('keydown', function(evt) {
      var keyCode = evt.keyCode;

      if (keyCode === view.CTRL_KEY) {
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

  styleOverlay: function(prop, value) {
    viewUtils.styleElem(view.overlay, prop, value);
  },

  showOverlay: function() {
    view.setVisibility('')
  },

  hideOverlay: function() {
    view.setVisibility('hidden');
  },

  setVisibility: function(newVisibility) {
    view.styleOverlay('visibility', newVisibility);
  }
}


var store = {
  db: {},
  lastElemPath: null,

  handleKey: function(keyCode) {
    if (store.lastElemPath) {
      store.db[keyCode] = store.lastElemPath;
      store.lastElemPath = null;
      view.hideOverlay();
    } else if (keyCode in store.db) {
      eval(store.db[keyCode]).click();
    }
  },

  savePathFromElement: function(elem) {
    store.lastElemPath = getEvalPath(getDomPath(elem));
  }
};

var init = function() {
  view.init();
};

init();
