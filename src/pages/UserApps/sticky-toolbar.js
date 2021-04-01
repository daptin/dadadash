!function (e) {
  function t(i) {
    if (n[i]) return n[i].exports;
    var o = n[i] = {i: i, l: !1, exports: {}};
    return e[i].call(o.exports, o, o.exports, t), o.l = !0, o.exports
  }

  var n = {};
  t.m = e, t.c = n, t.i = function (e) {
    return e
  }, t.d = function (e, n, i) {
    t.o(e, n) || Object.defineProperty(e, n, {configurable: !1, enumerable: !0, get: i})
  }, t.n = function (e) {
    var n = e && e.__esModule ? function () {
      return e.default
    } : function () {
      return e
    };
    return t.d(n, "a", n), n
  }, t.o = function (e, t) {
    return Object.prototype.hasOwnProperty.call(e, t)
  }, t.p = "", t(t.s = 1)
}([function (e, t, n) {
  "use strict";

  function i(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
  }

  var o = n(2), r = function (e) {
    return e && e.__esModule ? e : {default: e}
  }(o), s = function e(t, n) {
    i(this, e), this.quill = t, this.toolbar = t.getModule("toolbar");
    var o = this.toolbar.container, s = o.parentNode.parentNode.parentNode, l = s.getBoundingClientRect().top;
    window.addEventListener("scroll", function (e) {
      if (!e.target || !e.target.classList.contains("resize-sensor-expand") && !e.target.classList.contains("resize-sensor-shrink")) {
        e.target.scrollTop > l - 40 ? (o.style.position = "fixed", o.style.top = l - 1 + "px", o.style.width = s.clientWidth + "px", o.style.background = "#FFF", o.style.zIndex = "80") : (o.style.position = "relative", o.style.width = s.clientWidth + "px", o.style.top = "0px")
      }
    }, !0), new r.default(s, function () {
      o.style.width = s.clientWidth + "px"
    })
  };
  Quill.register("modules/sticky_toolbar", s)
}, function (e, t, n) {
  "use strict";
  var i = n(0);
  !function (e) {
    e && e.__esModule
  }(i)
}, function (e, t, n) {
  var i, o;
  !function (r, s) {
    i = s, void 0 !== (o = "function" == typeof i ? i.call(t, n, t, e) : i) && (e.exports = o)
  }(0, function () {
    function e(e, t) {
      var n = Object.prototype.toString.call(e),
        i = "[object Array]" === n || "[object NodeList]" === n || "[object HTMLCollection]" === n || "[object Object]" === n || "undefined" != typeof jQuery && e instanceof jQuery || "undefined" != typeof Elements && e instanceof Elements,
        o = 0, r = e.length;
      if (i) for (; o < r; o++) t(e[o]); else t(e)
    }

    if ("undefined" == typeof window) return null;
    var t = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function (e) {
      return window.setTimeout(e, 20)
    }, n = function (i, o) {
      function r() {
        var e = [];
        this.add = function (t) {
          e.push(t)
        };
        var t, n;
        this.call = function () {
          for (t = 0, n = e.length; t < n; t++) e[t].call()
        }, this.remove = function (i) {
          var o = [];
          for (t = 0, n = e.length; t < n; t++) e[t] !== i && o.push(e[t]);
          e = o
        }, this.length = function () {
          return e.length
        }
      }

      function s(e, t) {
        return e.currentStyle ? e.currentStyle[t] : window.getComputedStyle ? window.getComputedStyle(e, null).getPropertyValue(t) : e.style[t]
      }

      function l(e, n) {
        if (e.resizedAttached) {
          if (e.resizedAttached) return void e.resizedAttached.add(n)
        } else e.resizedAttached = new r, e.resizedAttached.add(n);
        e.resizeSensor = document.createElement("div"), e.resizeSensor.className = "resize-sensor";
        var i = "position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;",
          o = "position: absolute; left: 0; top: 0; transition: 0s;";
        e.resizeSensor.style.cssText = i, e.resizeSensor.innerHTML = '<div class="resize-sensor-expand" style="' + i + '"><div style="' + o + '"></div></div><div class="resize-sensor-shrink" style="' + i + '"><div style="' + o + ' width: 200%; height: 200%"></div></div>', e.appendChild(e.resizeSensor), "static" == s(e, "position") && (e.style.position = "relative");
        var l, c, d, a, u = e.resizeSensor.childNodes[0], f = u.childNodes[0], h = e.resizeSensor.childNodes[1],
          p = e.offsetWidth, y = e.offsetHeight, v = function () {
            f.style.width = "100000px", f.style.height = "100000px", u.scrollLeft = 1e5, u.scrollTop = 1e5, h.scrollLeft = 1e5, h.scrollTop = 1e5
          };
        v();
        var z = function () {
          c = 0, l && (p = d, y = a, e.resizedAttached && e.resizedAttached.call())
        }, w = function () {
          d = e.offsetWidth, a = e.offsetHeight, l = d != p || a != y, l && !c && (c = t(z)), v()
        }, g = function (e, t, n) {
          e.attachEvent ? e.attachEvent("on" + t, n) : e.addEventListener(t, n)
        };
        g(u, "scroll", w), g(h, "scroll", w)
      }

      e(i, function (e) {
        l(e, o)
      }), this.detach = function (e) {
        n.detach(i, e)
      }
    };
    return n.detach = function (t, n) {
      e(t, function (e) {
        e.resizedAttached && "function" == typeof n && (e.resizedAttached.remove(n), e.resizedAttached.length()) || e.resizeSensor && (e.contains(e.resizeSensor) && e.removeChild(e.resizeSensor), delete e.resizeSensor, delete e.resizedAttached)
      })
    }, n
  })
}]);
