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
exports.populateModelRoutes = (dir, allowedFnames = ['models.js', 'route.js', 'routes.js', 'admin.js']) => exports.build_dep_graph(exports.trivialWalk(dir)
    .map(p => [path_1.basename(p), p])
    .filter(([base, p]) => allowedFnames.indexOf(base) > -1)
    .map(([base, p]) => ({ [path_1.join(path_1.basename(path_1.dirname(p)), base)]: require(path_1.resolve(p)) })));
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
exports.raise = (throwable) => { throw throwable; };
exports.getError = (err) => {
    if (err === false)
        return null;
    if (typeof err['jse_shortmsg'] !== 'undefined') {
        const e = err;
        return e != null && e.body && e.body.error_message ? JSON.parse(e.body.error_message) : e;
    }
    if (err != null && typeof err['text'] !== 'undefined')
        err.message += ' | ' + err['text'];
    return err;
};
exports.superEndCb = (callback) => (e, r) => callback(r != null && r.error != null ? exports.getError(r.error) : exports.getError(e), r);
exports.debugCb = (name, callback) => (e, r) => console.warn(`${name}::e =`, e, `;\n${name}::r =`, r, ';') || callback(e, r);
exports.uniqIgnoreCb = (callback) => (err, res) => callback(err != null && err.message != null && err.message.indexOf('E_UNIQUE') === -1 ? err : void 0, res);
function* permute(permutation) {
    const length = permutation.length;
    const c = Array(length).fill(0);
    let i = 1;
    let k;
    let p;
    yield permutation.slice();
    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            yield permutation.slice();
        }
        else {
            c[i] = 0;
            ++i;
        }
    }
}
exports.permute = permute;
exports.build_dep_graph = (dependencies) => {
    const is_valid = (dep_free, models2deps, folder_names) => {
        const deps_existent = new Set(dep_free);
        for (const folder_name of folder_names)
            if (models2deps.get(folder_name)[1].some(dep => !deps_existent.has(dep)))
                return false;
            else
                deps_existent.add(folder_name);
        deps_existent.clear();
        return true;
    };
    const models2deps = new Map();
    const models_no_deps = new Map();
    const routes = new Set();
    const all_deps = new Map();
    dependencies.forEach(dep => {
        const k = Object.keys(dep)[0];
        all_deps.set(k, dep[k]);
        const d = path_1.dirname(k);
        const b = path_1.basename(k, '.js');
        if (['model', 'models'].indexOf(b) > -1) {
            const deps = dep[k]._dependencies || dep[k]['dependencies'];
            if (deps == null)
                models_no_deps.set(d, k);
            else
                models2deps.set(d, [k, deps]);
        }
        else if (['admin', 'route', 'routes'].indexOf(b) > -1)
            routes.add(k);
    });
    for (const models2deps_perm of permute(Array.from(models2deps).map(l => l[0])))
        if (is_valid(Array.from(models_no_deps.keys()), models2deps, models2deps_perm))
            return new Map(Array
                .from(models_no_deps.values())
                .concat(models2deps_perm.map(folder_name => models2deps.get(folder_name)[0]))
                .concat(Array.from(routes.values()))
                .map(fname => [fname, all_deps.get(fname)]));
    throw Error('Logic error: no permutation of your models is valid. Check your dependency lists.');
};
exports.groupByMap = (list, keyGetter) => {
    const map = new Map();
    const l = Array.from(list);
    l.forEach(value => {
        const key = keyGetter(value);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [value]);
        }
        else {
            collection.push(value);
        }
    });
    return map;
};
exports.get_models_routes = (models_routes) => Array.from(exports.groupByMap(models_routes, k => k[0].slice(0, k[0].indexOf('/')))).reduce((a, b) => Object.assign(a, {
    [b[0]]: b[1].map(fname_prog => ({ [path_1.basename(fname_prog[0], '.js')]: fname_prog[1] })).reduce((prev, curr) => Object.assign(prev, curr), {})
}), {});
exports.model_route_to_map = (model_route) => new Map(Object.entries(Object.keys(model_route).map(entity => Object.keys(model_route[entity]).map(m_or_r => ({ [path_1.join(entity, `${m_or_r}.js`)]: model_route[entity][m_or_r] }))).reduce((a, b) => a.concat(b), []).reduce((a, b) => Object.assign(a, b), {})));
exports.toSentenceCase = (s) => `${s[0].toLocaleUpperCase()}${s.slice(1)}`;
