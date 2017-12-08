'use strict';
var suman = require('suman');
var Test = suman.init(module);
////////////////////////////////////////////////////////////////////////
Test.create(function (pragmatik, assert, it) {
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
                required: true
            },
            {
                type: 'function',
                required: false
            }
        ]
    });
    function foo(a, b, c, d) {
        return pragmatik.parse(arguments, r);
    }
    it('basic #1', function (t) {
        var _a = foo('oh yes', { a: 'b' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
        assert.equal(a, 'oh yes');
        assert.equal(typeof b, 'object');
        assert.equal(c, undefined);
    });
    it('basic #1', [function (t) {
            var _a = foo('oh yes', { a: 'b' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            assert.equal(a, 'oh yes');
            assert.equal(typeof b, 'object');
            assert.equal(c, undefined);
        }]);
    it('basic #1', [function (t) {
            var _a = foo('oh yes', { a: 'b' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            assert.equal(a, 'oh yes');
            assert.equal(typeof b, 'object');
            assert.equal(c, undefined);
        }]);
    it('basic #2', { throws: /rules dictate that there are more required args than those passed/ }, function (t) {
        var _a = foo('oh yes'), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
    });
    it('basic #3', { throws: /Argument is required at argument index = 1, but type was wrong/ }, function (t) {
        var _a = foo('oh yes', function gg() {
        }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
    });
    it('basic #4', function (t) {
        var _a = foo('oh yes', { u: 's' }, function a() {
        }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
    });
    it('basic #5', { throws: /Argument is required at argument index = 1, but type was wrong. actual => "null". expected => "object"/ }, function (t) {
        var _a = foo('oh yes', null, function a() {
        }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
    });
});
