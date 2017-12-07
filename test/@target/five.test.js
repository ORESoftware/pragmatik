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
        // describe.skip('throw errors', b => {
        //
        //   it('args => [string,object] =>  (should throw because function is required)',
        //     {throws: /Argument is required at argument index.*but type was wrong/},
        //     t => {
        //       const [a, b, c, d] = foo('oh yes', {a: 'b'});
        //     });
        //
        //   it('[object] (should throw because function is required)',
        //     {throws: /Argument is required at argument index.*but type was wrong/},
        //     t => {
        //       const [a, b, c, d] = foo({a: 'b'});
        //     });
        //
        // });
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
        // describe.skip('should pass without errors', b => {
        //
        //   it('basic #1', t => {
        //
        //     const [a, b, c, d] = foo('cheese', function xyz() {
        //     });
        //
        //     t.assert.equal(a, 'cheese');
        //     t.assert.equal(b, undefined);
        //     t.assert.equal(c.name, 'xyz');
        //     t.assert.equal(d, undefined);
        //
        //   });
        //
        //   it('basic #2', t => {
        //
        //     const [a, b, c, d] = foo('bar', function noop() {
        //     });
        //
        //     t.assert.equal(a, 'bar');
        //     t.assert.equal(b, undefined);
        //     t.assert.equal(typeof c, 'function');
        //     t.assert.equal(d, undefined);
        //
        //   });
        //
        //   it('basic #2', {throws: /.*/}, t => {
        //
        //     //TODO: this should prob fail if allowExtraneousTrailingVars === false
        //
        //     const [a, b, c, d, e, f] = foo(function zzz() {
        //
        //     }, function ppp() {
        //
        //     });
        //
        //     t.assert.equal(a, undefined);
        //     t.assert.equal(b, undefined);
        //     t.assert.equal(c.name, 'noop');
        //     t.assert.equal(d.name, 'zzz');
        //     t.assert.equal(e.name, 'ppp');
        //
        //   });
        //
        //   it('basic #2', {}, t => {
        //
        //     // throw new Error('test error message 3');
        //
        //     //TODO: this should prob fail if allowExtraneousTrailingVars === false
        //
        //     // const [a, b, c, d, e, f] = foo(false,function noop() {
        //     // }, function zzz() {
        //     //
        //     // }, function ppp() {
        //     //
        //     // });
        //     //
        //     // assert.equal(a, undefined);
        //     // assert.equal(b, undefined);
        //     // assert.equal(c.name, 'noop');
        //     // assert.equal(d.name, 'zzz');
        //     // assert.equal(e.name, 'ppp');
        //
        //   });
        //
        // });
    });
});
