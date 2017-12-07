'use strict';
var suman = require('suman');
var Test = suman.init(module);
//////////////////////////////////////////////////////
Test.create(function (pragmatik, assert, util, it) {
    var r = pragmatik.signature({
        mode: 'strict',
        allowExtraneousTrailingVars: false,
        args: [
            {
                type: 'string',
                required: false,
                checks: [
                    function (val) {
                    }
                ]
            },
            {
                type: 'object',
                required: false,
                checks: [
                    function (val) {
                        assert('m' in val, 'property "m" not present.');
                    },
                ]
            },
            {
                type: 'function',
                required: false
            },
        ]
    });
    function foo() {
        return pragmatik.parse(arguments, r);
    }
    function compoundFoo() {
        return pragmatik.parse(foo.apply(null, arguments), r);
    }
    function tripleFoo() {
        return pragmatik.parse(compoundFoo.apply(null, arguments), r);
    }
    function quadrupleFoo() {
        return pragmatik.parse(tripleFoo.apply(null, arguments), r);
    }
    it('basic #1', function (t) {
        var args = [undefined, { m: 'hi' }, function () {
            }];
        var vals = [
            foo.apply(null, args),
            compoundFoo.apply(null, args),
            tripleFoo.apply(null, args),
            quadrupleFoo.apply(null, args)
        ];
        vals.forEach(function (v) {
            var a = v[0], b = v[1], c = v[2], d = v[3];
            assert(a === undefined, 'a should be undefined');
            assert.equal(typeof b, 'object', 'b should be an object');
            assert.equal(typeof c, 'function', 'c should be a function');
            assert(d === undefined, 'd should be undefined');
        });
    });
    it('basic #12', function (t) {
        var _a = foo('', { m: 'dog' }, function () {
        }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
    });
    it('basic #13', function (t) {
        var _a = foo({ m: 'dog' }, function () {
        }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
    });
});
