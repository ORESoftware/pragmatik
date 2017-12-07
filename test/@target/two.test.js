'use strict';
var suman = require('suman');
var Test = suman.init(module);
///////////////////////////////////////////////////////////////////////
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
                required: false
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
        var _a = foo('oh yes', function (t) { }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
        assert.equal(a, 'oh yes');
        assert.equal(typeof b, 'undefined');
        assert.equal(c.name, '');
    });
    it('basic #1', function (t) {
        var _a = foo('oh yes', { a: 'b' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
        assert.equal(a, 'oh yes');
        assert.equal(typeof b, 'object');
        assert.equal(c, undefined);
    });
    it('basic #2', function (t) {
        var _a = foo('oh yes'), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
        assert.equal(a, 'oh yes');
        assert.equal(b, undefined);
        assert.equal(c, undefined);
    });
});
