'use strict';
var suman = require('suman');
var Test = suman.init(module);
///////////////////////////////////////////////////////////////////////////////
Test.create(function (pragmatik, assert, util, it) {
    var r = pragmatik.signature({
        mode: 'strict',
        allowMoreArgs: false,
        allowExtraneousTrailingVars: false,
        args: [
            {
                type: 'string',
                required: false,
                checks: [
                    function (val) {
                        return true;
                    }
                ]
            },
            {
                type: 'object',
                required: true
            },
            {
                type: 'function',
                required: false
            },
            {
                type: 'string',
                required: true
            },
            {
                type: 'string',
                required: false
            },
            {
                type: 'object',
                required: true,
                checks: [
                    function (val) {
                        assert('z' in val, 'fff property not present.');
                    }
                ]
            },
            {
                type: 'object',
                required: true,
                checks: [
                    function (val) {
                        assert('m' in val, 'property not present.');
                    },
                ]
            },
        ]
    });
    function foo() {
        return pragmatik.parse(arguments, r);
    }
    it('basic #1', function (t) {
        var _a = foo({ a: 'b' }, 'yolo', 'mogo', { z: 'e' }, { m: 'k' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5], g = _a[6], h = _a[7], i = _a[8];
        assert.equal(a, undefined);
        assert.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify({ a: 'b' })));
        assert.equal(c, undefined);
        assert.equal(d, 'yolo');
        assert.equal(e, 'mogo');
        assert.deepEqual(f, { z: 'e' });
        assert.deepEqual(g, { m: 'k' });
        assert.equal(h, undefined);
        assert.equal(i, undefined);
    });
});
