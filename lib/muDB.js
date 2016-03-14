//var muDB = function(e){e=e||null;if(e!==null){this.setDB(e)}return this};muDB.prototype={db:{},cb:null,curpath:null,setDB:function(e){this.db=e},getDB:function(){return this.db},addObserver:function(e){this.cb=e},notify:function(e,t){if(this.cb){this.cb(e,this.curpath,t)}},expand:function(e){if(typeof e=="object"&&e!==null&&e.toString().indexOf("[object HTML")==-1){for(var t in e){e[t]=this.expand(e[t])}}else if(typeof e=="string"){if(e.charAt(0)=="$"){e=this.expand(this.get(e.slice(1)))}}return e},get:function(e,t){data=this.search(e);if(data==null){if(e.charAt(0)=="$"){e=e.slice(1);data=this.search(e)}if(data==null){return null}}if(typeof data==="string"){if(data.charAt(0)=="$"){e=data.slice(1);data=this.search(e)}}if(t==undefined){t=true}if(t){data=this.expand(data)}return data},set:function(e,t,n,r){n=n||false;this.curpath=e||null;e=e.split(".");this._set(this.db,e,t,n);this.notify("set",r)},search:function(e,t){t=t||false;e=e.split(".");return this._search(this.db,e,t)},filter:function(e,t,n,r){e=this.checkObjRef(e);r=r||-1;if(typeof n=="string"&&n.indexOf("%%")>-1){return this._fuzzyFilter(e,t,n.substr(0,n.length-2),r)}if(n===null){return this._nullFilter(e,t,r)}var i=[];if(e instanceof Array){if(e.length){for(var s=0;s<e.length;s+=1){if(this._search(e[s],t.split("."))==n){i.push(e[s])}if(r>-1&&i.length>=r){break}}}}else{for(var o in e){if(e.hasOwnProperty(o)){var u=this._search(e[o],t.split("."));if(u&&u==n){if(r===-1||i.length<r){i.push(e[o])}}}}}if(i.length){return i}return null},findOne:function(e,t,n){var r=this.filter(e,t,n,1);if(r&&r.length){return r[0]}return null},keyExists:function(e,t){e=this.checkObjRef(e);if(e.hasOwnProperty(t)){return true}return false},checkObjRef:function(e){e=e||null;if(e!==null){e=typeof e=="string"?this.get(e):e}else{e=this.db}return e},del:function(e,t){this.curpath=e||null;e=e.split(".");return this._del(this.db,e);this.notify("del",t)},_set:function(e,t,n,r){key=t.shift();if(e.hasOwnProperty(key)){if(t.length==0){if(r&&typeof n==="object"){for(k in n){e[key][k]=n[k]}}else{e[key]=n;return}}else{this._set(e[key],t,n,r)}}else{if(t.length==0){e[key]=n}else{e[key]={};this._set(e[key],t,n,r)}}},_search:function(e,t,n){var r=t.shift();if(e!==undefined&&e.hasOwnProperty(r)){if(t.length==0){if(n)return e;return e[r]}return this._search(e[r],t,n)}return null},_nullFilter:function(e,t,n){var r=[];if(e instanceof Array){if(e.length){for(var i=0;i<e.length;i+=1){if(this._search(e[i],t.split("."))){r.push(e[i])}if(n>-1&&r.length>=n){break}}}}else{for(var s in e){if(e.hasOwnProperty(s)){if(this._search(e[s],t.split("."))){if(n===-1||r.length<n){r.push(e[s])}}}}}if(r.length){return r}return null},_fuzzyFilter:function(e,t,n,r){var i=[];if(e instanceof Array){if(e.length){for(var s=0;s<e.length;s+=1){var o=this._search(e[s],t.split("."));if(o){if(o.toLowerCase().indexOf(n)>-1){i.push(e[s])}}if(r>-1&&i.length>=r){break}}}}else{for(var u in e){if(e.hasOwnProperty(u)){var o=this._search(e[u],t.split("."));if(o&&o.toLowerCase().indexOf(n)>-1){if(r===-1||i.length<r){i.push(e[u])}}}}}if(i.length){return i}return null},_del:function(e,t){key=t.shift();if(e.hasOwnProperty(key)){if(t.length==0){delete e[key];return true}else{this._del(e[key],t)}}else if(e[key]){if(t.length==0){delete e[key];return true}else{this._del(e[key],t)}}else{return false}}}

var muDB = function(e) {
    e = e || null;
    if (e !== null) {
        this.setDB(e)
    }
    this.uniq = Date.now();
    this.db = {};
    return this;
};

var EXPANDtimes = 0
	, maxEXPANDtimes = 5000000
	;

muDB.prototype = {
    //db: {}, // data was bleeding between muDB instances with this being set here! (now, set above in construct)
    cb: null,
    curpath: null,
    setDB: function(e) {
        this.db = e
    },
    getDB: function() {
        return this.db
    },
    addObserver: function(e) {
        this.cb = e
    },
    notify: function(e, t) {
        if (this.cb) {
            this.cb(e, this.curpath, t)
        }
    },
    expand: function(e) {
    	EXPANDtimes += 1;
    	if (EXPANDtimes > maxEXPANDtimes) {
    		EXPANDtimes = 0;
    		console.log(e);
    		throw new Error('expanding rapidly');
    	}
    	if (EXPANDtimes > maxEXPANDtimes - 20) {
    		console.log(e);
    	}
        if (typeof e == "object" && e !== null && e.toString().indexOf("[object HTML") == -1) {
            for (var t in e) {
                e[t] = this.expand(e[t])
            }
        } else if (typeof e == "string") {
            if (e.charAt(0) == "$") {
                e = this.expand(this.get(e.slice(1)))
            }
        }
        return e
    },
    get: function(e, t) {
        var data = this.search(e);
        if (data == null) {
            if (e.charAt(0) == "$") {
                e = e.slice(1);
                data = this.search(e)
            }
            if (data == null) {
                return null
            }
        }
        if (typeof data === "string") {
            if (data.charAt(0) == "$") {
                e = data.slice(1);
                data = this.search(e)
            }
        }
        if (t == undefined) {
            t = true
        }
        if (t) {
            data = this.expand(data)
        }
        return data
    },
    set: function(e, t, n, r) {
        n = n || false;
        this.curpath = e || null;
        e = e.split(".");
        this._set(this.db, e, t, n);
        this.notify("set", r)
    },
    search: function(e, t) {
        t = t || false;
        e = e.split(".");
        return this._search(this.db, e, t)
    },
    filter: function(e, t, n, r) {
        e = this.checkObjRef(e);
        r = r || -1;
        if (typeof n == "string" && n.indexOf("%%") > -1) {
            return this._fuzzyFilter(e, t, n.substr(0, n.length - 2), r)
        }
        if (n === null) {
            return this._nullFilter(e, t, r)
        }
        var i = [];
        if (e instanceof Array) {
            if (e.length) {
                for (var s = 0; s < e.length; s += 1) {
                    if (this._search(e[s], t.split(".")) == n) {
                        i.push(e[s])
                    }
                    if (r > -1 && i.length >= r) {
                        break
                    }
                }
            }
        } else {
            for (var o in e) {
                if (e.hasOwnProperty(o)) {
                    var u = this._search(e[o], t.split("."));
                    if (u && u == n) {
                        if (r === -1 || i.length < r) {
                            i.push(e[o])
                        }
                    }
                }
            }
        }
        if (i.length) {
            return i
        }
        return null
    },
    findOne: function(e, t, n) {
        var r = this.filter(e, t, n, 1);
        if (r && r.length) {
            return r[0]
        }
        return null
    },
    keyExists: function(e, t) {
        e = this.checkObjRef(e);
        if (e.hasOwnProperty(t)) {
            return true
        }
        return false
    },
    checkObjRef: function(e) {
        e = e || null;
        if (e !== null) {
            e = typeof e == "string" ? this.get(e) : e
        } else {
            e = this.db
        }
        return e
    },
    del: function(e, t) {
        this.curpath = e || null;
        e = e.split(".");
        return this._del(this.db, e);
        this.notify("del", t)
    },
    _set: function(e, t, n, r) {
        var key = t.shift();
        if (e.hasOwnProperty(key)) {
            if (t.length == 0) {
                if (r && typeof n === "object") {
                    for (k in n) {
                        e[key][k] = n[k]
                    }
                } else {
                    e[key] = n;
                    return
                }
            } else {
                this._set(e[key], t, n, r)
            }
        } else {
            if (t.length == 0) {
                e[key] = n
            } else {
                e[key] = {};
                this._set(e[key], t, n, r)
            }
        }
    },
    _search: function(e, t, n) {
        var r = t.shift();
        if (e !== undefined && e.hasOwnProperty(r)) {
            if (t.length == 0) {
                if (n) return e;
                return e[r]
            }
            return this._search(e[r], t, n)
        }
        return null
    },
    _nullFilter: function(e, t, n) {
        var r = [];
        if (e instanceof Array) {
            if (e.length) {
                for (var i = 0; i < e.length; i += 1) {
                    if (this._search(e[i], t.split("."))) {
                        r.push(e[i])
                    }
                    if (n > -1 && r.length >= n) {
                        break
                    }
                }
            }
        } else {
            for (var s in e) {
                if (e.hasOwnProperty(s)) {
                    if (this._search(e[s], t.split("."))) {
                        if (n === -1 || r.length < n) {
                            r.push(e[s])
                        }
                    }
                }
            }
        }
        if (r.length) {
            return r
        }
        return null
    },
    _fuzzyFilter: function(e, t, n, r) {
        var i = [];
        if (e instanceof Array) {
            if (e.length) {
                for (var s = 0; s < e.length; s += 1) {
                    var o = this._search(e[s], t.split("."));
                    if (o) {
                        if (o.toLowerCase().indexOf(n) > -1) {
                            i.push(e[s])
                        }
                    }
                    if (r > -1 && i.length >= r) {
                        break
                    }
                }
            }
        } else {
            for (var u in e) {
                if (e.hasOwnProperty(u)) {
                    var o = this._search(e[u], t.split("."));
                    if (o && o.toLowerCase().indexOf(n) > -1) {
                        if (r === -1 || i.length < r) {
                            i.push(e[u])
                        }
                    }
                }
            }
        }
        if (i.length) {
            return i
        }
        return null
    },
    _del: function(e, t) {
        var key = t.shift();
        if (e.hasOwnProperty(key)) {
            if (t.length == 0) {
                delete e[key];
                return true
            } else {
                this._del(e[key], t)
            }
        } else if (e[key]) {
            if (t.length == 0) {
                delete e[key];
                return true
            } else {
                this._del(e[key], t)
            }
        } else {
            return false
        }
    }
}

module.exports = muDB;
