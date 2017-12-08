'use strict';
var suman = require('suman');
var Test = suman.init(module, {}, {
    allowSkip: true
});
////////////////////////////////////////////////////////////////
Test.create(function (pragmatik, assert, it, describe) {
    var r = pragmatik.signature({
        mode: 'strict',
        allowExtraneousTrailingVars: false,
        extraneousVarsErrorMessage: 'Too many args.',
        args: [
            {
                type: 'string',
                required: false,
                errorMessage: 'test error message 1',
                checks: [
                    function (val) {
                        return String(val).match(/.*/);
                    }
                ]
            },
            {
                type: 'object',
                required: false,
                errorMessage: 'test error message 2'
            },
            {
                type: 'function',
                required: true,
                errorMessage: 'test error message 3'
            }
        ]
    });
    function foo() {
        return pragmatik.parse(arguments, r);
    }
    describe('wrapper', function (b) {
        describe('throw errors', function (b) {
            it('args => [string,object] =>  (should throw because function is required)', { throws: /Argument is required at argument index.*but type was wrong/ }, function (t) {
                var _a = foo('oh yes', { a: 'b' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            });
            it('[object] (should throw because function is required)', { throws: /Argument is required at argument index.*but type was wrong/ }, function (t) {
                var _a = foo({ a: 'b' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            });
        });
        it('args => [null, Function]  (should pass)', function (t) {
            var _a = foo(null, function z() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            t.assert.deepEqual(a, null);
            t.assert.deepEqual(b, undefined);
            t.assert.equal(c.name, 'z');
        });
        it('args => [null, Function] (should pass)', function (t) {
            var _a = foo(function z() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            t.assert.deepEqual(a, undefined);
            t.assert.deepEqual(b, undefined);
            t.assert.equal(c.name, 'z');
        });
        it('args => [null, Function] (should pass)', function (t) {
            var _a = foo(null, function z() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            t.assert.deepEqual(a, null);
            t.assert.deepEqual(b, undefined);
            t.assert.equal(c.name, 'z');
        });
        it('args => [null, Function] (should pass)', function (t) {
            var _a = foo(undefined, function z() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            t.assert.deepEqual(a, undefined);
            t.assert.deepEqual(b, undefined);
            t.assert.equal(c.name, 'z');
        });
        it.skip('basic #1', function (t) {
            var _a = foo(null, null, null, function z() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            t.assert.deepEqual(a, null);
            t.assert.deepEqual(b, null);
            t.assert.equal(c.name, 'z');
        });
        it('basic #1', function (t) {
            var _a = foo(null, null, function z() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            t.assert.deepEqual(a, null);
            t.assert.deepEqual(b, null);
            t.assert.equal(c.name, 'z');
        });
        it('basic #1', function (t) {
            var _a = foo({}, function z() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            t.assert.deepEqual(a, undefined);
            t.assert.deepEqual(b, {});
            t.assert.equal(c.name, 'z');
        });
        describe('should pass without errors', function (b) {
            it('basic #1', function (t) {
                var _a = foo('cheese', function xyz() {
                }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
                t.assert.equal(a, 'cheese');
                t.assert.equal(b, undefined);
                t.assert.equal(c.name, 'xyz');
                t.assert.equal(d, undefined);
            });
            it('basic #2', function (t) {
                var _a = foo('bar', function noop() {
                }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
                t.assert.equal(a, 'bar');
                t.assert.equal(b, undefined);
                t.assert.equal(typeof c, 'function');
                t.assert.equal(d, undefined);
            });
            it('basic #2', { throws: /.*/ }, function (t) {
                //TODO: this should prob fail if allowExtraneousTrailingVars === false
                var _a = foo(function zzz() {
                }, function ppp() {
                }), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
                t.assert.equal(a, undefined);
                t.assert.equal(b, undefined);
                t.assert.equal(c.name, 'noop');
                t.assert.equal(d.name, 'zzz');
                t.assert.equal(e.name, 'ppp');
            });
            it('basic #2', {}, function (t) {
                // throw new Error('test error message 3');
                //TODO: this should prob fail if allowExtraneousTrailingVars === false
                // const [a, b, c, d, e, f] = foo(false,function noop() {
                // }, function zzz() {
                //
                // }, function ppp() {
                //
                // });
                //
                // assert.equal(a, undefined);
                // assert.equal(b, undefined);
                // assert.equal(c.name, 'noop');
                // assert.equal(d.name, 'zzz');
                // assert.equal(e.name, 'ppp');
            });
        });
    });
});
