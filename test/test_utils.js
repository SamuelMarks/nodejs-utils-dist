"use strict";
var chai_1 = require('chai');
var index_1 = require('../index');
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
    describe('uri_to_config', function () {
        it('should work with full', function () {
            return chai_1.expect(index_1.uri_to_config('postgresql://postgres:postgres@localhost/postgres')).to.deep.equal({
                "database": "postgres",
                "host": "localhost",
                "identity": "postgres",
                "password": "postgres",
                "user": "postgres",
            });
        });
        it('should work with minimal', function () {
            return chai_1.expect(index_1.uri_to_config('postgresql://localhost')).to.deep.equal({
                "host": "localhost",
                "identity": "postgres",
                "user": "postgres"
            });
        });
    });
});
