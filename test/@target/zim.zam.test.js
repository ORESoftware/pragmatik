var suman = require('suman');
var Test = suman.init(module);
Test.create('basic tests', function (pragmatik, assert, it) {
    var r = pragmatik.signature({
        mode: 'strict',
        allowExtraneousTrailingVars: false,
        args: [
            {
                type: 'string',
                required: false
            },
            {
                type: 'boolean',
                required: true
            },
            {
                type: 'object',
                required: true
            },
            {
                type: 'boolean',
                required: false
            },
            {
                type: 'function',
                required: false
            }
        ]
    });
    function foo() {
        return pragmatik.parse(arguments, r);
    }
    it('zims and zams (1)', function (t) {
        var _a = foo(true, { zim: 'zam' }, function () {
        }), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
        assert.equal(a, undefined, 'a is not undefined.');
        assert.equal(b, true, 'b is not true, but should be true.');
        assert.deepEqual(c, { zim: 'zam' }, 'c is not the object it is supposed to be.');
        assert.deepEqual(d, undefined, 'd is not undefined.');
        assert.deepEqual(typeof e, 'function', 'e should be a function.');
    });
    it('zims and zams (2)', { throws: /Argument is required at argument index = 1, but type was wrong/ }, function (t) {
        var _a = foo('dog', { zim: 'zam' }, function () {
        }), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
    });
    it('zims and zams (3)', { throws: /Argument is required at argument index = 2, but type was wrong/ }, function (t) {
        var _a = foo('dog', false, function () {
        }), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
    });
});
