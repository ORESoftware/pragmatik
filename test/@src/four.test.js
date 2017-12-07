'use strict';

const suman = require('suman');
const Test = suman.init(module);

//////////////////////////////////////////////////////////////////////

Test.create(function (pragmatik, assert, it, describe) {

  const r = pragmatik.signature({

    mode: 'strict', // does not allow two adjacent non-required types to be the same
    allowMoreArgs: false,
    allowExtraneousTrailingVars: false,
    args: [
      {
        type: 'string',
        required: true,
      },
      {
        type: 'object',
        required: false,
      },
      {
        type: 'function',
        required: true,
      }
    ]
  });

  function foo(a, b, c, d) {
    return pragmatik.parse(arguments, r);
  }


  describe('all tests here', b => {

    it('missing final argument', {throws: /Argument is required at argument index = 2/}, t => {
      const [a, b, c, d] = foo('oh yes', {a: 'b'});
    });

    it('missing middle argument', t => {

      const [a, b, c, d] = foo('bar', function noop() {
      });

      assert.equal(a, 'bar');
      assert.equal(b, undefined);
      assert.equal(typeof c, 'function');

    });

    it('basic #2', {
        throws: /rules dictate that there are more required args than those passed to function/
      },
      t => {

        const [a, b, c, d] = foo(function noop() {
        });

      });

  });



});
