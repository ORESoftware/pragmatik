'use strict';
var suman = require('suman');
var Test = suman.init(module);
//////////////////////////////////////////////////////////////////////
Test.create(function (pragmatik, assert, it, describe) {
    var r = pragmatik.signature({
        mode: 'strict',
        allowMoreArgs: false,
        allowExtraneousTrailingVars: false,
        args: [
            {
                type: 'string',
                required: true
            },
            {
                type: 'object',
                required: false
            },
            {
                type: 'function',
                required: true
            }
        ]
    });
    function foo(a, b, c, d) {
        return pragmatik.parse(arguments, r);
    }
    describe('all tests here', function (b) {
        it('missing final argument', { throws: /Argument is required at argument index = 2/ }, function (t) {
            var _a = foo('oh yes', { a: 'b' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
        });
        it('missing middle argument', function (t) {
            var _a = foo('bar', function noop() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            assert.equal(a, 'bar');
            assert.equal(b, undefined);
            assert.equal(typeof c, 'function');
        });
        it('basic #2', {
            throws: /rules dictate that there are more required args than those passed to function/
        }, function (t) {
            var _a = foo(function noop() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
        });
    });
});
