var suman = require('suman');
var Test = suman.init(module);
Test.create('basic tests', {}, function (pragmatik, assert) {
    var r = pragmatik.signature({
        mode: 'strict',
        parseToObject: false,
        allowExtraneousTrailingVars: false,
        extraneousVarsErrorMessage: 'Too many args. Signature is Test.describe(String s, [opts o], Function f)',
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
    this.describe('bs', function () {
        this.it('basic #1', function (t) {
            assert.throws(function () {
                var _a = foo('oh yes', { a: 'b' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            }, /Argument is required at argument index.*but type was wrong/);
        });
        this.it('basic #1', function (t) {
            assert.throws(function () {
                var _a = foo({ a: 'b' }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            }, /Argument is required at argument index.*but type was wrong/);
        });
        this.it('basic #1', function (t) {
            var _a = foo(null, function z() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            assert.equal(a, undefined);
            assert.equal(b, null);
            assert.equal(c.name, 'z');
        });
        this.it('basic #1', function (t) {
            var _a = foo('cheese', function xyz() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            assert.equal(a, 'cheese');
            assert.equal(b, undefined);
            assert.equal(c.name, 'xyz');
            assert.equal(d, undefined);
        });
        this.it('basic #2', function (t) {
            var _a = foo('bar', function noop() {
            }), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            assert.equal(a, 'bar');
            assert.equal(b, undefined);
            assert.equal(typeof c, 'function');
            assert.equal(d, undefined);
        });
    });
    this.it('basic #2', { throws: /.*/ }, function (t) {
        var _a = foo(function zzz() {
        }, function ppp() {
        }), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
        assert.equal(a, undefined);
        assert.equal(b, undefined);
        assert.equal(c.name, 'noop');
        assert.equal(d.name, 'zzz');
        assert.equal(e.name, 'ppp');
    });
    this.it('basic #2', {}, function (t) {
    });
});
