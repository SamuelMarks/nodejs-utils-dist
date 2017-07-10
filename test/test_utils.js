"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var fs_1 = require("fs");
var chai_1 = require("chai");
var index_1 = require("../index");
var os_1 = require("os");
var path_1 = require("path");
var rimraf = require("rimraf");
describe('utils::helpers', function () {
    describe('binarySearch', function () {
        var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        var comparator = function (a, b) { return a > b; };
        it('should find each element', function () {
            return array.map(function (elem) { return chai_1.expect(index_1.binarySearch(array, elem, comparator)).to.be.gt(-1); });
        });
        it('should not find an element', function () {
            return [50, -1, 0, null, 'hello', undefined, '', NaN, {}, []].map(function (elem) { return chai_1.expect(index_1.binarySearch(array, elem, comparator)).to.be.lte(-1); });
        });
        it('should handle empty list', function () {
            return chai_1.expect(index_1.binarySearch([], 5, comparator)).to.be.lte(-1);
        });
    });
    describe('isShallowSubset', function () {
        describe('success', function () {
            describe('[number] [number]', function () {
                it('can be found with two empty lists', function () {
                    return chai_1.expect(index_1.isShallowSubset([], [])).to.be.true;
                });
                it('can be found with two identical lists', function () {
                    return chai_1.expect(index_1.isShallowSubset([1, 2, 3], [1, 2, 3])).to.be.true;
                });
                it('can be found with two identical, differently ordered lists', function () {
                    return chai_1.expect(index_1.isShallowSubset([1, 2, 3], [3, 2, 1])).to.be.true;
                });
                it('can be found with array_0.length < array_1.length', function () {
                    return chai_1.expect(index_1.isShallowSubset([1, 2, 5], [1, 2, 5, 6])).to.be.true;
                });
            });
            describe('Object Object', function () {
                it('can be found with two empty objects', function () {
                    return chai_1.expect(index_1.isShallowSubset({}, {})).to.be.true;
                });
                it('can be found with two identical objects', function () {
                    return chai_1.expect(index_1.isShallowSubset({ a: 1 }, { a: 1 })).to.be.true;
                });
                it('can be found with two object_0.length < object_1.length', function () {
                    return chai_1.expect(index_1.isShallowSubset({ a: 1 }, { a: 1, b: 6 })).to.be.true;
                });
            });
        });
        describe('failure', function () {
            describe('[number] [number]', function () {
                it('experienced with array_1 empty', function () {
                    return chai_1.expect(index_1.isShallowSubset([5], [])).to.be.false;
                });
                it('experienced with two different, same sized lists', function () {
                    return chai_1.expect(index_1.isShallowSubset([1, 2, 7], [2, 2, 5])).to.be.false;
                });
                it('experienced with two different, different sized lists', function () {
                    it('list 0', function () { return chai_1.expect(index_1.isShallowSubset([7, 1, 2, 5], [10, 35, 2, 2, 5])).to.be.false; });
                    it('list 1', function () { return chai_1.expect(index_1.isShallowSubset([1, 2, 5, 6], [2, 2, 5])).to.be.false; });
                });
                it('experienced with array_0.length > array_1.length', function () {
                    return chai_1.expect(index_1.isShallowSubset([1, 2, 5, 6], [1, 2, 5])).to.be.false;
                });
            });
            describe('Object Object', function () {
                it('experienced with object_1 empty', function () {
                    return chai_1.expect(index_1.isShallowSubset({ a: 5 }, {})).to.be.false;
                });
                it('experienced with with two same length, different objects', function () {
                    return chai_1.expect(index_1.isShallowSubset({ a: 1 }, { b: 1 })).to.be.false;
                });
                it('experienced with with two different length, different objects', function () {
                    return chai_1.expect(index_1.isShallowSubset({ a: 1, c: 7 }, { b: 1, j: 10, l: null })).to.be.false;
                });
                it('experienced with two object_0.length > object_1.length', function () {
                    return chai_1.expect(index_1.isShallowSubset({ a: 1, b: 6 }, { a: 1 })).to.be.false;
                });
            });
        });
        describe('irl', function () {
            var schema = {
                email: { type: 'string' },
                password: { type: 'string' },
                title: { type: 'string' },
                first_name: { type: 'string' },
                last_names: { type: 'string' }
            };
            it('should validate with good request-body', function () { return [
                { email: 'fff' },
                { title: 'sfsdf' },
                { title: 'sfsdf', email: 'sdf' }
            ].map(function (request) { return chai_1.expect(index_1.isShallowSubset(request, schema)).to.be.true; }); });
            it('should fail with bad request-body', function () { return [
                { foo: 'dsf' },
                { bar: 'can', haz: 'baz' },
                { title: 'foo', haz: 'baz' }
            ].map(function (request) { return chai_1.expect(index_1.isShallowSubset(request, schema)).to.be.false; }); });
        });
    });
    describe('trivialWalk and populateModelRoutes', function () {
        before('create full tree', function (callback) {
            return fs_1.mkdtemp(path_1.join(os_1.tmpdir(), 'nodejs-utils-test_'), function (err, dir) {
                if (err)
                    return callback(err);
                _this.dir = dir;
                _this.tree = [
                    [_this.dir, 'routes.js'],
                    [path_1.join(_this.dir, 'api', 'jarring'), 'routes.js'],
                    [path_1.join(_this.dir, 'api3', 'car'), 'models.js'],
                    [path_1.join(_this.dir, 'can'), 'routes.js'],
                    [path_1.join(_this.dir, 'jar', 'far', 'raw'), 'models.js'],
                    [path_1.join(_this.dir, 'node_modules', 'far', 'raw'), 'admin.js'],
                ];
                async.map(_this.tree, function (dir_file, cb) {
                    return async.series([
                        function (call_back) { return index_1.mkdirP(dir_file[0], call_back); },
                        function (call_back) {
                            return fs_1.open(path_1.join.apply(void 0, dir_file), 'w', call_back);
                        },
                        function (call_back) {
                            return fs_1.writeFile(path_1.join.apply(void 0, dir_file), 'exports.bar = function(){}', 'utf8', call_back);
                        }
                    ], cb);
                }, callback);
            });
        });
        after('delete full tree', function (callback) {
            return rimraf(_this.dir, callback);
        });
        before('create empty tree', function (callback) {
            return fs_1.mkdtemp(path_1.join(os_1.tmpdir(), 'nodejs-utils-test_'), function (err, dir) {
                if (err)
                    return callback(err);
                _this.empty_dir = dir;
                return callback();
            });
        });
        after('delete empty tree', function (callback) {
            return fs_1.rmdir(_this.empty_dir, callback);
        });
        describe('trivialWalk', function () {
            it('should work on empty tree', function () {
                var res = index_1.trivialWalk(_this.empty_dir);
                chai_1.expect(res).to.be.an.instanceOf(Array);
                chai_1.expect(res).to.be.empty || (function () { return undefined; })();
            });
            it('should work 3 levels deep', function () {
                return chai_1.expect(index_1.trivialWalk(_this.dir)).to.have.members(_this.tree.map(function (dir_file) { return path_1.join.apply(void 0, dir_file); }));
            });
            it('should filter 3 levels deep', function () {
                return chai_1.expect(index_1.trivialWalk(_this.dir, ['node_modules'])).to.have.members(_this.tree.map(function (dir_file) { return path_1.join.apply(void 0, dir_file); }));
            });
        });
        describe('populateModelRoutes', function () {
            it('should work on empty tree', function () {
                var res = index_1.populateModelRoutes(_this.empty_dir);
                chai_1.expect(res).to.be.an.instanceOf(Object);
                chai_1.expect(res).to.be.empty || (function () { return undefined; })();
            });
            it('should work 3 levels deep', function () {
                var res = index_1.populateModelRoutes(_this.dir);
                chai_1.expect(res).to.be.an.instanceOf(Object);
                var keys = [
                    'jarring', 'car', 'can', 'raw', path_1.basename(_this.dir)
                ];
                chai_1.expect(res).to.have.all.keys(keys);
                keys.map(function (key) { return chai_1.expect(res[key]).to.have.any.keys(['models', 'admin', 'routes']); });
            });
        });
    });
});
