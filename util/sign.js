module.exports = (obj) => {
  let str = obj;
  if (typeof obj === 'object') {
    str = JSON.stringify(obj);
  }
  return getSign(str);
}

var O = function() {
  if ("undefined" != typeof self)
    return self;
  if ("undefined" != typeof window)
    return window;
  if ("undefined" != typeof global)
    return global;
  throw new Error("unable to locate global object")
}();
O.__sign_hash_20200305 = function(e) {
  function d(e, t) {
    var o = (65535 & e) + (65535 & t);
    return (e >> 16) + (t >> 16) + (o >> 16) << 16 | 65535 & o
  }
  function s(e, t, o, n, i, r) {
    return d((a = d(d(t, e), d(n, r))) << (s = i) | a >>> 32 - s, o);
    var a, s
  }
  function p(e, t, o, n, i, r, a) {
    return s(t & o | ~t & n, e, t, i, r, a)
  }
  function m(e, t, o, n, i, r, a) {
    return s(t & n | o & ~n, e, t, i, r, a)
  }
  function f(e, t, o, n, i, r, a) {
    return s(t ^ o ^ n, e, t, i, r, a)
  }
  function h(e, t, o, n, i, r, a) {
    return s(o ^ (t | ~n), e, t, i, r, a)
  }
  function t(e) {
    return function(e) {
      var t, o = "";
      for (t = 0; t < 32 * e.length; t += 8)
        o += String.fromCharCode(e[t >> 5] >>> t % 32 & 255);
      return o
    }(function(e, t) {
      e[t >> 5] |= 128 << t % 32,
        e[14 + (t + 64 >>> 9 << 4)] = t;
      var o, n, i, r, a, s = 1732584193, c = -271733879, l = -1732584194, u = 271733878;
      for (o = 0; o < e.length; o += 16)
        c = h(c = h(c = h(c = h(c = f(c = f(c = f(c = f(c = m(c = m(c = m(c = m(c = p(c = p(c = p(c = p(i = c, l = p(r = l, u = p(a = u, s = p(n = s, c, l, u, e[o], 7, -680876936), c, l, e[o + 1], 12, -389564586), s, c, e[o + 2], 17, 606105819), u, s, e[o + 3], 22, -1044525330), l = p(l, u = p(u, s = p(s, c, l, u, e[o + 4], 7, -176418897), c, l, e[o + 5], 12, 1200080426), s, c, e[o + 6], 17, -1473231341), u, s, e[o + 7], 22, -45705983), l = p(l, u = p(u, s = p(s, c, l, u, e[o + 8], 7, 1770035416), c, l, e[o + 9], 12, -1958414417), s, c, e[o + 10], 17, -42063), u, s, e[o + 11], 22, -1990404162), l = p(l, u = p(u, s = p(s, c, l, u, e[o + 12], 7, 1804603682), c, l, e[o + 13], 12, -40341101), s, c, e[o + 14], 17, -1502002290), u, s, e[o + 15], 22, 1236535329), l = m(l, u = m(u, s = m(s, c, l, u, e[o + 1], 5, -165796510), c, l, e[o + 6], 9, -1069501632), s, c, e[o + 11], 14, 643717713), u, s, e[o], 20, -373897302), l = m(l, u = m(u, s = m(s, c, l, u, e[o + 5], 5, -701558691), c, l, e[o + 10], 9, 38016083), s, c, e[o + 15], 14, -660478335), u, s, e[o + 4], 20, -405537848), l = m(l, u = m(u, s = m(s, c, l, u, e[o + 9], 5, 568446438), c, l, e[o + 14], 9, -1019803690), s, c, e[o + 3], 14, -187363961), u, s, e[o + 8], 20, 1163531501), l = m(l, u = m(u, s = m(s, c, l, u, e[o + 13], 5, -1444681467), c, l, e[o + 2], 9, -51403784), s, c, e[o + 7], 14, 1735328473), u, s, e[o + 12], 20, -1926607734), l = f(l, u = f(u, s = f(s, c, l, u, e[o + 5], 4, -378558), c, l, e[o + 8], 11, -2022574463), s, c, e[o + 11], 16, 1839030562), u, s, e[o + 14], 23, -35309556), l = f(l, u = f(u, s = f(s, c, l, u, e[o + 1], 4, -1530992060), c, l, e[o + 4], 11, 1272893353), s, c, e[o + 7], 16, -155497632), u, s, e[o + 10], 23, -1094730640), l = f(l, u = f(u, s = f(s, c, l, u, e[o + 13], 4, 681279174), c, l, e[o], 11, -358537222), s, c, e[o + 3], 16, -722521979), u, s, e[o + 6], 23, 76029189), l = f(l, u = f(u, s = f(s, c, l, u, e[o + 9], 4, -640364487), c, l, e[o + 12], 11, -421815835), s, c, e[o + 15], 16, 530742520), u, s, e[o + 2], 23, -995338651), l = h(l, u = h(u, s = h(s, c, l, u, e[o], 6, -198630844), c, l, e[o + 7], 10, 1126891415), s, c, e[o + 14], 15, -1416354905), u, s, e[o + 5], 21, -57434055), l = h(l, u = h(u, s = h(s, c, l, u, e[o + 12], 6, 1700485571), c, l, e[o + 3], 10, -1894986606), s, c, e[o + 10], 15, -1051523), u, s, e[o + 1], 21, -2054922799), l = h(l, u = h(u, s = h(s, c, l, u, e[o + 8], 6, 1873313359), c, l, e[o + 15], 10, -30611744), s, c, e[o + 6], 15, -1560198380), u, s, e[o + 13], 21, 1309151649), l = h(l, u = h(u, s = h(s, c, l, u, e[o + 4], 6, -145523070), c, l, e[o + 11], 10, -1120210379), s, c, e[o + 2], 15, 718787259), u, s, e[o + 9], 21, -343485551),
          s = d(s, n),
          c = d(c, i),
          l = d(l, r),
          u = d(u, a);
      return [s, c, l, u]
    }(function(e) {
      var t, o = [];
      for (o[(e.length >> 2) - 1] = void 0,
             t = 0; t < o.length; t += 1)
        o[t] = 0;
      for (t = 0; t < 8 * e.length; t += 8)
        o[t >> 5] |= (255 & e.charCodeAt(t / 8)) << t % 32;
      return o
    }(e), 8 * e.length))
  }
  function o(e) {
    return t(unescape(encodeURIComponent(e)))
  }
  return function(e) {
    var t, o, n = "0123456789abcdef", i = "";
    for (o = 0; o < e.length; o += 1)
      t = e.charCodeAt(o),
        i += n.charAt(t >>> 4 & 15) + n.charAt(15 & t);
    return i
  }(o(e))
}
  ,
  function s(c, l, u, d, p) {
    p = p || [[this], [{}]];
    for (var t = [], o = null, e = [function() {
      return !0
    }
      , function() {}
      , function() {
        p.length = u[l++]
      }
      , function() {
        p.push(u[l++])
      }
      , function() {
        p.pop()
      }
      , function() {
        var e = u[l++]
          , t = p[p.length - 2 - e];
        p[p.length - 2 - e] = p.pop(),
          p.push(t)
      }
      , function() {
        p.push(p[p.length - 1])
      }
      , function() {
        p.push([p.pop(), p.pop()].reverse())
      }
      , function() {
        p.push([d, p.pop()])
      }
      , function() {
        p.push([p.pop()])
      }
      , function() {
        var e = p.pop();
        p.push(e[0][e[1]])
      }
      , function() {
        p.push(p[p.pop()[0]][0])
      }
      , function() {
        var e = p[p.length - 2];
        e[0][e[1]] = p[p.length - 1]
      }
      , function() {
        p[p[p.length - 2][0]][0] = p[p.length - 1]
      }
      , function() {
        var e = p.pop()
          , t = p.pop();
        p.push([t[0][t[1]], e])
      }
      , function() {
        var e = p.pop();
        p.push([p[p.pop()][0], e])
      }
      , function() {
        var e = p.pop();
        p.push(delete e[0][e[1]])
      }
      , function() {
        var e = [];
        for (var t in p.pop())
          e.push(t);
        p.push(e)
      }
      , function() {
        p[p.length - 1].length ? p.push(p[p.length - 1].shift(), !0) : p.push(void 0, !1)
      }
      , function() {
        var e = p[p.length - 2]
          , t = Object.getOwnPropertyDescriptor(e[0], e[1]) || {
          configurable: !0,
          enumerable: !0
        };
        t.get = p[p.length - 1],
          Object.defineProperty(e[0], e[1], t)
      }
      , function() {
        var e = p[p.length - 2]
          , t = Object.getOwnPropertyDescriptor(e[0], e[1]) || {
          configurable: !0,
          enumerable: !0
        };
        t.set = p[p.length - 1],
          Object.defineProperty(e[0], e[1], t)
      }
      , function() {
        l = u[l++]
      }
      , function() {
        var e = u[l++];
        p[p.length - 1] && (l = e)
      }
      , function() {
        throw p[p.length - 1]
      }
      , function() {
        var e = u[l++]
          , t = e ? p.slice(-e) : [];
        p.length -= e,
          p.push(p.pop().apply(d, t))
      }
      , function() {
        var e = u[l++]
          , t = e ? p.slice(-e) : [];
        p.length -= e;
        var o = p.pop();
        p.push(o[0][o[1]].apply(o[0], t))
      }
      , function() {
        var e = u[l++]
          , t = e ? p.slice(-e) : [];
        p.length -= e,
          t.unshift(null),
          p.push(new (Function.prototype.bind.apply(p.pop(), t)))
      }
      , function() {
        var e = u[l++]
          , t = e ? p.slice(-e) : [];
        p.length -= e,
          t.unshift(null);
        var o = p.pop();
        p.push(new (Function.prototype.bind.apply(o[0][o[1]], t)))
      }
      , function() {
        p.push(!p.pop())
      }
      , function() {
        p.push(~p.pop())
      }
      , function() {
        p.push(typeof p.pop())
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] == p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] === p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] > p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] >= p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] << p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] >> p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] >>> p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] + p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] - p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] * p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] / p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] % p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] | p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] & p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] ^ p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2]in p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2]instanceof p.pop()
      }
      , function() {
        p[p[p.length - 1][0]] = void 0 === p[p[p.length - 1][0]] ? [] : p[p[p.length - 1][0]]
      }
      , function() {
        for (var n = u[l++], i = [], e = u[l++], t = u[l++], r = [], o = 0; o < e; o++)
          i[u[l++]] = p[u[l++]];
        for (var a = 0; a < t; a++)
          r[a] = u[l++];
        p.push(function e() {
          var t = i.slice(0);
          t[0] = [this],
            t[1] = [arguments],
            t[2] = [e];
          for (var o = 0; o < r.length && o < arguments.length; o++)
            0 < r[o] && (t[r[o]] = [arguments[o]]);
          return s(c, n, u, d, t)
        })
      }
      , function() {
        t.push([u[l++], p.length, u[l++]])
      }
      , function() {
        t.pop()
      }
      , function() {
        return !!o
      }
      , function() {
        o = null
      }
      , function() {
        p[p.length - 1] += String.fromCharCode(u[l++])
      }
      , function() {
        p.push("")
      }
      , function() {
        p.push(void 0)
      }
      , function() {
        p.push(null)
      }
      , function() {
        p.push(!0)
      }
      , function() {
        p.push(!1)
      }
      , function() {
        p.length -= u[l++]
      }
      , function() {
        p[p.length - 1] = u[l++]
      }
      , function() {
        var e = p.pop()
          , t = p[p.length - 1];
        t[0][t[1]] = p[e[0]][0]
      }
      , function() {
        var e = p.pop()
          , t = p[p.length - 1];
        t[0][t[1]] = e[0][e[1]]
      }
      , function() {
        var e = p.pop()
          , t = p[p.length - 1];
        p[t[0]][0] = p[e[0]][0]
      }
      , function() {
        var e = p.pop()
          , t = p[p.length - 1];
        p[t[0]][0] = e[0][e[1]]
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] < p.pop()
      }
      , function() {
        p[p.length - 2] = p[p.length - 2] <= p.pop()
      }
    ]; ; )
      try {
        for (; !e[u[l++]](); )
          ;
        if (o)
          throw o;
        return p.pop()
      } catch (e) {
        var n = t.pop();
        if (void 0 === n)
          throw e;
        o = e,
          l = n[0],
          p.length = n[1],
        n[2] && (p[n[2]][0] = o)
      }
  }(120731, 0, [21, 34, 50, 100, 57, 50, 102, 50, 98, 99, 101, 52, 54, 97, 52, 99, 55, 56, 52, 49, 57, 54, 57, 49, 56, 98, 102, 100, 100, 48, 48, 55, 55, 102, 2, 10, 3, 2, 9, 48, 61, 3, 9, 48, 61, 4, 9, 48, 61, 5, 9, 48, 61, 6, 9, 48, 61, 7, 9, 48, 61, 8, 9, 48, 61, 9, 9, 48, 4, 21, 427, 54, 2, 15, 3, 2, 9, 48, 61, 3, 9, 48, 61, 4, 9, 48, 61, 5, 9, 48, 61, 6, 9, 48, 61, 7, 9, 48, 61, 8, 9, 48, 61, 9, 9, 48, 61, 10, 9, 48, 61, 11, 9, 48, 61, 12, 9, 48, 61, 13, 9, 48, 61, 14, 9, 48, 61, 10, 9, 55, 54, 97, 54, 98, 54, 99, 54, 100, 54, 101, 54, 102, 54, 103, 54, 104, 54, 105, 54, 106, 54, 107, 54, 108, 54, 109, 54, 110, 54, 111, 54, 112, 54, 113, 54, 114, 54, 115, 54, 116, 54, 117, 54, 118, 54, 119, 54, 120, 54, 121, 54, 122, 54, 48, 54, 49, 54, 50, 54, 51, 54, 52, 54, 53, 54, 54, 54, 55, 54, 56, 54, 57, 13, 4, 61, 11, 9, 55, 54, 77, 54, 97, 54, 116, 54, 104, 8, 55, 54, 102, 54, 108, 54, 111, 54, 111, 54, 114, 14, 55, 54, 77, 54, 97, 54, 116, 54, 104, 8, 55, 54, 114, 54, 97, 54, 110, 54, 100, 54, 111, 54, 109, 14, 25, 0, 3, 4, 9, 11, 3, 3, 9, 11, 39, 3, 1, 38, 40, 3, 3, 9, 11, 38, 25, 1, 13, 4, 61, 12, 9, 55, 13, 4, 61, 13, 9, 3, 0, 13, 4, 4, 3, 13, 9, 11, 3, 11, 9, 11, 66, 22, 306, 4, 21, 422, 24, 4, 3, 14, 9, 55, 54, 77, 54, 97, 54, 116, 54, 104, 8, 55, 54, 102, 54, 108, 54, 111, 54, 111, 54, 114, 14, 55, 54, 77, 54, 97, 54, 116, 54, 104, 8, 55, 54, 114, 54, 97, 54, 110, 54, 100, 54, 111, 54, 109, 14, 25, 0, 3, 10, 9, 55, 54, 108, 54, 101, 54, 110, 54, 103, 54, 116, 54, 104, 15, 10, 40, 25, 1, 13, 4, 61, 12, 9, 6, 11, 3, 10, 9, 3, 14, 9, 11, 15, 10, 38, 13, 4, 61, 13, 9, 6, 11, 6, 5, 1, 5, 0, 3, 1, 38, 13, 4, 61, 0, 5, 0, 43, 4, 21, 291, 61, 3, 12, 9, 11, 0, 3, 9, 9, 49, 72, 0, 2, 3, 4, 13, 4, 61, 8, 9, 21, 721, 3, 2, 8, 3, 2, 9, 48, 61, 3, 9, 48, 61, 4, 9, 48, 61, 5, 9, 48, 61, 6, 9, 48, 61, 7, 9, 48, 4, 55, 54, 115, 54, 101, 54, 108, 54, 102, 8, 10, 30, 55, 54, 117, 54, 110, 54, 100, 54, 101, 54, 102, 54, 105, 54, 110, 54, 101, 54, 100, 32, 28, 22, 510, 4, 21, 523, 22, 4, 55, 54, 115, 54, 101, 54, 108, 54, 102, 8, 10, 0, 55, 54, 119, 54, 105, 54, 110, 54, 100, 54, 111, 54, 119, 8, 10, 30, 55, 54, 117, 54, 110, 54, 100, 54, 101, 54, 102, 54, 105, 54, 110, 54, 101, 54, 100, 32, 28, 22, 566, 4, 21, 583, 3, 4, 55, 54, 119, 54, 105, 54, 110, 54, 100, 54, 111, 54, 119, 8, 10, 0, 55, 54, 103, 54, 108, 54, 111, 54, 98, 54, 97, 54, 108, 8, 10, 30, 55, 54, 117, 54, 110, 54, 100, 54, 101, 54, 102, 54, 105, 54, 110, 54, 101, 54, 100, 32, 28, 22, 626, 4, 21, 643, 25, 4, 55, 54, 103, 54, 108, 54, 111, 54, 98, 54, 97, 54, 108, 8, 10, 0, 55, 54, 69, 54, 114, 54, 114, 54, 111, 54, 114, 8, 55, 54, 117, 54, 110, 54, 97, 54, 98, 54, 108, 54, 101, 54, 32, 54, 116, 54, 111, 54, 32, 54, 108, 54, 111, 54, 99, 54, 97, 54, 116, 54, 101, 54, 32, 54, 103, 54, 108, 54, 111, 54, 98, 54, 97, 54, 108, 54, 32, 54, 111, 54, 98, 54, 106, 54, 101, 54, 99, 54, 116, 27, 1, 23, 56, 0, 49, 444, 0, 0, 24, 0, 13, 4, 61, 8, 9, 55, 54, 95, 54, 95, 54, 103, 54, 101, 54, 116, 54, 83, 54, 101, 54, 99, 54, 117, 54, 114, 54, 105, 54, 116, 54, 121, 54, 83, 54, 105, 54, 103, 54, 110, 15, 21, 1126, 49, 2, 14, 3, 2, 9, 48, 61, 3, 9, 48, 61, 4, 9, 48, 61, 5, 9, 48, 61, 6, 9, 48, 61, 7, 9, 48, 61, 8, 9, 48, 61, 9, 9, 48, 61, 10, 9, 48, 61, 11, 9, 48, 61, 9, 9, 55, 54, 108, 54, 111, 54, 99, 54, 97, 54, 116, 54, 105, 54, 111, 54, 110, 8, 10, 30, 55, 54, 117, 54, 110, 54, 100, 54, 101, 54, 102, 54, 105, 54, 110, 54, 101, 54, 100, 32, 28, 22, 862, 21, 932, 21, 4, 55, 54, 108, 54, 111, 54, 99, 54, 97, 54, 116, 54, 105, 54, 111, 54, 110, 8, 55, 54, 104, 54, 111, 54, 115, 54, 116, 14, 55, 54, 105, 54, 110, 54, 100, 54, 101, 54, 120, 54, 79, 54, 102, 14, 55, 54, 121, 54, 46, 54, 113, 54, 113, 54, 46, 54, 99, 54, 111, 54, 109, 25, 1, 3, 0, 3, 1, 39, 32, 22, 963, 4, 55, 54, 67, 54, 74, 54, 66, 54, 80, 54, 65, 54, 67, 54, 114, 54, 82, 54, 117, 54, 78, 54, 121, 54, 55, 21, 974, 50, 4, 3, 12, 9, 11, 3, 8, 3, 10, 24, 2, 13, 4, 61, 10, 9, 3, 13, 9, 55, 54, 95, 54, 95, 54, 115, 54, 105, 54, 103, 54, 110, 54, 95, 54, 104, 54, 97, 54, 115, 54, 104, 54, 95, 54, 50, 54, 48, 54, 50, 54, 48, 54, 48, 54, 51, 54, 48, 54, 53, 15, 10, 22, 1030, 21, 1087, 22, 4, 3, 13, 9, 55, 54, 95, 54, 95, 54, 115, 54, 105, 54, 103, 54, 110, 54, 95, 54, 104, 54, 97, 54, 115, 54, 104, 54, 95, 54, 50, 54, 48, 54, 50, 54, 48, 54, 48, 54, 51, 54, 48, 54, 53, 15, 3, 9, 9, 11, 3, 3, 9, 11, 38, 25, 1, 13, 4, 61, 11, 9, 3, 12, 9, 11, 3, 10, 3, 53, 3, 37, 39, 24, 2, 13, 4, 4, 55, 54, 122, 54, 122, 54, 97, 3, 11, 9, 11, 38, 3, 10, 9, 11, 38, 0, 49, 771, 2, 1, 12, 9, 13, 8, 3, 12, 4, 4, 56, 0], O);
var getSign = O.__getSecuritySign