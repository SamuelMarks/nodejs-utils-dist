"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async = require("async");
const fs_1 = require("fs");
const chai_1 = require("chai");
const index_1 = require("../index");
const os_1 = require("os");
const path_1 = require("path");
const rimraf = require("rimraf");
describe('utils::helpers', () => {
    describe('binarySearch', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const comparator = (a, b) => a > b;
        it('should find each element', () => array.map(elem => chai_1.expect(index_1.binarySearch(array, elem, comparator)).to.be.gt(-1)));
        it('should not find an element', () => [50, -1, 0, null, 'hello', undefined, '', NaN, {}, []].map(elem => chai_1.expect(index_1.binarySearch(array, elem, comparator)).to.be.lte(-1)));
        it('should handle empty list', () => chai_1.expect(index_1.binarySearch([], 5, comparator)).to.be.lte(-1));
    });
    describe('isShallowSubset', () => {
        describe('success', () => {
            describe('[number] [number]', () => {
                it('can be found with two empty lists', () => chai_1.expect(index_1.isShallowSubset([], [])).to.be.true);
                it('can be found with two identical lists', () => chai_1.expect(index_1.isShallowSubset([1, 2, 3], [1, 2, 3])).to.be.true);
                it('can be found with two identical, differently ordered lists', () => chai_1.expect(index_1.isShallowSubset([1, 2, 3], [3, 2, 1])).to.be.true);
                it('can be found with array_0.length < array_1.length', () => chai_1.expect(index_1.isShallowSubset([1, 2, 5], [1, 2, 5, 6])).to.be.true);
            });
            describe('Object Object', () => {
                it('can be found with two empty objects', () => chai_1.expect(index_1.isShallowSubset({}, {})).to.be.true);
                it('can be found with two identical objects', () => chai_1.expect(index_1.isShallowSubset({ a: 1 }, { a: 1 })).to.be.true);
                it('can be found with two object_0.length < object_1.length', () => chai_1.expect(index_1.isShallowSubset({ a: 1 }, { a: 1, b: 6 })).to.be.true);
            });
        });
        describe('failure', () => {
            describe('[number] [number]', () => {
                it('experienced with array_1 empty', () => chai_1.expect(index_1.isShallowSubset([5], [])).to.be.false);
                it('experienced with two different, same sized lists', () => chai_1.expect(index_1.isShallowSubset([1, 2, 7], [2, 2, 5])).to.be.false);
                it('experienced with two different, different sized lists', () => {
                    it('list 0', () => chai_1.expect(index_1.isShallowSubset([7, 1, 2, 5], [10, 35, 2, 2, 5])).to.be.false);
                    it('list 1', () => chai_1.expect(index_1.isShallowSubset([1, 2, 5, 6], [2, 2, 5])).to.be.false);
                });
                it('experienced with array_0.length > array_1.length', () => chai_1.expect(index_1.isShallowSubset([1, 2, 5, 6], [1, 2, 5])).to.be.false);
            });
            describe('Object Object', () => {
                it('experienced with object_1 empty', () => chai_1.expect(index_1.isShallowSubset({ a: 5 }, {})).to.be.false);
                it('experienced with with two same length, different objects', () => chai_1.expect(index_1.isShallowSubset({ a: 1 }, { b: 1 })).to.be.false);
                it('experienced with with two different length, different objects', () => chai_1.expect(index_1.isShallowSubset({ a: 1, c: 7 }, { b: 1, j: 10, l: null })).to.be.false);
                it('experienced with two object_0.length > object_1.length', () => chai_1.expect(index_1.isShallowSubset({ a: 1, b: 6 }, { a: 1 })).to.be.false);
            });
        });
        describe('irl', () => {
            const schema = {
                email: { type: 'string' },
                password: { type: 'string' },
                title: { type: 'string' },
                first_name: { type: 'string' },
                last_names: { type: 'string' }
            };
            it('should validate with good request-body', () => [
                { email: 'fff' },
                { title: 'sfsdf' },
                { title: 'sfsdf', email: 'sdf' }
            ].map(request => chai_1.expect(index_1.isShallowSubset(request, schema)).to.be.true));
            it('should fail with bad request-body', () => [
                { foo: 'dsf' },
                { bar: 'can', haz: 'baz' },
                { title: 'foo', haz: 'baz' }
            ].map(request => chai_1.expect(index_1.isShallowSubset(request, schema)).to.be.false));
        });
    });
    describe('trivialWalk and populateModelRoutes', () => {
        before('create full tree', callback => fs_1.mkdtemp(path_1.join(os_1.tmpdir(), 'nodejs-utils-test_'), (err, dir) => {
            if (err)
                return callback(err);
            this.dir = dir;
            this.tree = [
                [this.dir, 'routes.js'],
                [path_1.join(this.dir, 'api', 'jarring'), 'routes.js'],
                [path_1.join(this.dir, 'api3', 'car'), 'models.js'],
                [path_1.join(this.dir, 'can'), 'routes.js'],
                [path_1.join(this.dir, 'jar', 'far', 'raw'), 'models.js'],
                [path_1.join(this.dir, 'node_modules', 'far', 'raw'), 'admin.js'],
            ];
            async.map(this.tree, (dir_file, cb) => async.series([
                call_back => index_1.mkdirP(dir_file[0], void 0, call_back),
                call_back => fs_1.open(path_1.join(...dir_file), 'w', call_back),
                call_back => fs_1.writeFile(path_1.join(...dir_file), 'exports.bar = function(){}', 'utf8', call_back)
            ], cb), callback);
        }));
        after('delete full tree', callback => rimraf(this.dir, callback));
        before('create empty tree', callback => fs_1.mkdtemp(path_1.join(os_1.tmpdir(), 'nodejs-utils-test_'), (err, dir) => {
            if (err)
                return callback(err);
            this.empty_dir = dir;
            return callback();
        }));
        after('delete empty tree', callback => fs_1.rmdir(this.empty_dir, callback));
        describe('trivialWalk', () => {
            it('should work on empty tree', () => {
                const res = index_1.trivialWalk(this.empty_dir);
                chai_1.expect(res).to.be.an.instanceOf(Array);
                chai_1.expect(res).to.be.empty || (() => undefined)();
            });
            it('should work 3 levels deep', () => chai_1.expect(index_1.trivialWalk(this.dir)).to.have.members(this.tree.map((dir_file) => path_1.join(...dir_file))));
            it('should filter 3 levels deep', () => chai_1.expect(index_1.trivialWalk(this.dir, ['node_modules'])).to.have.members(this.tree.map((dir_file) => path_1.join(...dir_file))));
        });
        describe('populateModelRoutes', () => {
            it('should work on empty tree', () => {
                const res = index_1.populateModelRoutes(this.empty_dir);
                chai_1.expect(res).to.be.an.instanceOf(Object);
                chai_1.expect(res).to.be.empty || (() => undefined)();
            });
            it('should work 3 levels deep', () => {
                const res = index_1.populateModelRoutes(this.dir);
                chai_1.expect(res).to.be.an.instanceOf(Object);
                const keys = [
                    'jarring', 'car', 'can', 'raw', path_1.basename(this.dir)
                ];
                chai_1.expect(res).to.have.all.keys(keys);
                keys.map(key => chai_1.expect(res[key]).to.have.any.keys(['models', 'admin', 'routes']));
            });
        });
    });
    describe('format', () => {
        it('works with basic object', () => {
            const json = { 'mises': 'was', 'was': 'right' };
            const text = 'Mises ${mises} ${was}';
            chai_1.expect(index_1.format(text, json)).to.be.eql('Mises was right');
        });
    });
});
