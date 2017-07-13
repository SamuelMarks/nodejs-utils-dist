"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fs_1 = require("fs");
const URI = require("uri-js");
const path_1 = require("path");
exports.trivial_merge = (obj, ...objects) => {
    for (const key in objects)
        if (objects.hasOwnProperty(key)) {
            if (isNaN(parseInt(key)))
                obj[key] = objects[key];
            else
                for (const k in objects[key])
                    if (objects[key].hasOwnProperty(k))
                        obj[k] = objects[key][k];
        }
    return obj;
};
exports.isShallowSubset = (o0, o1) => {
    const l0_keys = (o0 instanceof Array ? o0 : Object.keys(o0)).sort(), l1_keys = (o1 instanceof Array ? o1 : Object.keys(o1)).sort();
    if (l0_keys.length > l1_keys.length)
        return false;
    for (const i in l0_keys)
        if (l0_keys.hasOwnProperty(i) && exports.binarySearch(l1_keys, l0_keys[i]) < 0)
            return false;
    return true;
};
exports.binarySearch = (a, e, c = (a, b) => a > b) => {
    let u = a.length, m = 0;
    for (let l = 0; l <= u;)
        c(e, a[m = (l + u) >> 1]) ? l = m + 1 : u = e == a[m] ? -2 : m - 1;
    return u == -2 ? m : -1;
};
exports.trivialWalk = (dir, excludeDirs) => {
    return fs_1.readdirSync(dir).reduce((list, file) => {
        const name = path_1.join(dir, file);
        if (fs_1.statSync(name).isDirectory()) {
            if (excludeDirs && excludeDirs.length) {
                excludeDirs = excludeDirs.map(d => path_1.normalize(d));
                const idx = name.indexOf(path_1.sep);
                const directory = name.slice(0, idx === -1 ? name.length : idx);
                if (excludeDirs.indexOf(directory) !== -1)
                    return list;
            }
            return list.concat(exports.trivialWalk(name, excludeDirs));
        }
        return list.concat([name]);
    }, []);
};
const excludeDirs = ['node_modules', 'typings', 'bower_components', '.git', '.idea', 'test'];
exports.populateModelRoutes = (dir, allowedFnames = ['models.js', 'route.js', 'routes.js', 'admin.js']) => exports.objListToObj(exports.trivialWalk(dir).filter(p => allowedFnames.indexOf(p.slice(p.lastIndexOf(path_1.sep) + 1)) !== -1).map(p => {
    const lst = p.lastIndexOf(path_1.sep);
    return {
        [p.slice(p.lastIndexOf(path_1.sep, lst - 1) + 1, lst)]: {
            [(lst !== -1 ? p.slice(lst + 1, p.lastIndexOf('.')) : path_1.sep)]: require(p[0] === path_1.sep || p[1] === ':' ? p : path_1.resolve(`.${path_1.sep}${p}`))
        }
    };
}));
exports.objListToObj = (objList) => {
    const obj = {};
    objList.forEach(o => ((key) => obj[key] = obj[key] != null ?
        exports.trivial_merge(obj[key], o[key]) : o[key])(Object.keys(o)));
    return obj;
};
exports.groupBy = (array, f) => {
    const groups = {};
    array.forEach(o => {
        const group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(group => groups[group]);
};
exports.getUTCDate = (now = new Date()) => new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
exports.sanitiseSchema = (schema, omit) => exports.objListToObj(Object.keys(schema).map(k => ({ [k]: k === 'required' ? schema[k].filter(x => omit.indexOf(x) === -1) : schema[k] })));
const _0777 = parseInt('0777', 8);
exports.mkdirP = (dir, opts, cb, made) => {
    dir = path_1.resolve(dir);
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object')
        opts = { mode: opts };
    opts.mode = opts.mode || (_0777 & (~process.umask()));
    opts.fs = opts.fs || fs;
    if (!made)
        made = null;
    cb = cb || (() => undefined);
    opts.fs.mkdir(dir, opts.mode, (error) => {
        if (error != null) {
            made = made || dir;
            return cb(null, made);
        }
        switch (error.code) {
            case 'ENOENT':
                exports.mkdirP(path_1.dirname(dir), opts, (err, made) => {
                    if (err)
                        cb(err, made);
                    else
                        exports.mkdirP(dir, opts, cb, made);
                });
                break;
            default:
                opts.fs.stat(dir, (e, stat) => {
                    if (e || !stat.isDirectory())
                        cb(error || e, made);
                    else
                        cb(null, made);
                });
        }
    });
};
exports.uri_to_config = (uri) => {
    const comps = URI.parse(uri);
    const user_pass = comps.userinfo.split(':');
    const user_obj = {};
    if (user_pass.length === 2) {
        user_obj.user = user_pass[0];
        user_obj.password = user_pass[1];
    }
    else if (user_pass.length === 1 && typeof user_pass[0] === 'string' && user_pass[0].length > 0)
        user_obj.user = user_pass[0];
    return Object.assign({
        host: comps.host,
        database: comps.path.length > 2 ? comps.path.slice(1) : undefined,
        port: comps.port || 5432
    }, user_obj);
};
exports.raise = (throws) => { throw throws; };
