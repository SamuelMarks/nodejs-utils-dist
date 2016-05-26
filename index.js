"use strict";
var fs_1 = require('fs');
var path_1 = require('path');
function trivial_merge(obj) {
    var objects = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objects[_i - 1] = arguments[_i];
    }
    for (var key in objects)
        if (objects.hasOwnProperty(key)) {
            if (isNaN(parseInt(key)))
                obj[key] = objects[key];
            else
                for (var k in objects[key])
                    if (objects[key].hasOwnProperty(k))
                        obj[k] = objects[key][k];
        }
    return obj;
}
exports.trivial_merge = trivial_merge;
function uri_to_config(uri) {
    return (function (arr) {
        switch (arr.length) {
            case 3:
                var user = arr[0];
                return (trivial_merge({
                    user: user,
                    identity: user
                }, function passwd_host() {
                    var at_at = arr[1].search('@');
                    if (at_at === -1)
                        return { host: arr[1] };
                    return {
                        pass: arr[1].substr(0, at_at),
                        host: arr[1].substr(at_at + 1)
                    };
                }(), function port_db() {
                    var slash_at = arr[2].search('/');
                    if (slash_at === -1)
                        return { database: arr[2] };
                    return {
                        port: arr[2].substr(0, slash_at),
                        database: arr[2].substr(slash_at + 1)
                    };
                }()));
            case 2:
                var u = arr[0].substr(arr[0].search('//') + 2);
                return trivial_merge({
                    user: u,
                    identity: u
                }, function passwd_host_db() {
                    function host_db(s) {
                        var slash_at = s.search('/');
                        if (slash_at === -1)
                            return { host: s };
                        return {
                            host: s.substr(0, slash_at),
                            database: s.substr(slash_at + 1)
                        };
                    }
                    var at_at = arr[1].search('@');
                    if (at_at === -1)
                        return host_db(arr[1]);
                    return trivial_merge({ password: arr[1].substr(0, at_at) }, host_db(arr[1].substr(at_at + 1)));
                }());
            case 1:
                return {
                    user: 'postgres',
                    identity: 'postgres',
                    host: arr[0].substr(arr[0].search('//') + 2)
                };
            default:
                throw TypeError('Unable to acquire config from uri');
        }
    })(uri.slice('postgres'.length + 3).split(':'));
}
exports.uri_to_config = uri_to_config;
function isShallowSubset(o0, o1) {
    var l0_keys = (o0 instanceof Array ? o0 : Object.keys(o0)).sort(), l1_keys = (o1 instanceof Array ? o1 : Object.keys(o1)).sort();
    if (l0_keys.length > l1_keys.length)
        return false;
    for (var i in l0_keys)
        if (l0_keys.hasOwnProperty(i) && binarySearch(l1_keys, l0_keys[i]) < 0)
            return false;
    return true;
}
exports.isShallowSubset = isShallowSubset;
function binarySearch(a, e, c) {
    if (c === void 0) { c = function (a, b) { return a > b; }; }
    var u = a.length, m = 0;
    for (var l = 0; l <= u;)
        c(e, a[m = (l + u) >> 1]) ? l = m + 1 : u = e == a[m] ? -2 : m - 1;
    return u == -2 ? m : -1;
}
exports.binarySearch = binarySearch;
function trivialWalk(dir, excludeDirs) {
    return fs_1.readdirSync(dir).reduce(function (list, file) {
        var name = path_1.join(dir, file);
        if (fs_1.statSync(name).isDirectory()) {
            if (excludeDirs && excludeDirs.length) {
                excludeDirs = excludeDirs.map(function (d) { return path_1.normalize(d); });
                var idx = name.indexOf(path_1.sep);
                var directory = name.slice(0, idx === -1 ? name.length : idx);
                if (excludeDirs.indexOf(directory) !== -1)
                    return list;
            }
            return list.concat(trivialWalk(name, excludeDirs));
        }
        return list.concat([name]);
    }, []);
}
exports.trivialWalk = trivialWalk;
function populateModelRoutes(dir) {
    return objListToObj(Array.prototype.concat.apply([], trivialWalk(dir, ['node_modules', 'typings', 'bower_components', '.git', '.idea', 'test']).map(function (p) {
        var fst = (function (_idx) { return _idx === -1 ? p.length : _idx; })(p.indexOf(path_1.sep));
        var snd = (function (_idx) { return _idx === -1 ? p.length : _idx; })(p.indexOf(path_1.sep, fst + 1));
        var allowedFnames = ['models.js', 'routes.js', 'admin.js'];
        var fname = (function (f) { return allowedFnames.indexOf(f) !== -1 ? f : null; })(p.slice(snd + 1, p.length));
        return fname ? (_a = {},
            _a[p.slice(fst + 1, snd)] = (_b = {},
                _b[p.slice(p.lastIndexOf(path_1.sep) + 1, p.indexOf('.'))] = require(['.', '..', p].join(path_1.sep).split(path_1.sep).join('/')),
                _b
            ),
            _a
        ) : undefined;
        var _a, _b;
    })).filter(function (_) { return _; }));
}
exports.populateModelRoutes = populateModelRoutes;
function objListToObj(objList) {
    var obj = {};
    objList.forEach(function (o) { return (function (key) { return obj[key] = obj[key] ? trivial_merge(obj[key], o[key]) : o[key]; })(Object.keys(o)); });
    return obj;
}
exports.objListToObj = objListToObj;
function groupBy(array, f) {
    var groups = {};
    array.forEach(function (o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    });
}
exports.groupBy = groupBy;
function getUTCDate(now) {
    if (now === void 0) { now = new Date(); }
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
}
exports.getUTCDate = getUTCDate;
function sanitiseSchema(schema, omit) {
    return objListToObj(Object.keys(schema).map(function (k) {
        return (_a = {}, _a[k] = k === 'required' ? schema[k].filter(function (x) { return omit.indexOf(x) === -1; }) : schema[k], _a);
        var _a;
    }));
}
exports.sanitiseSchema = sanitiseSchema;
