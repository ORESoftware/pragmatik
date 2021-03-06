'use strict';

const suman = require('suman');
const Test = suman.init(module);

///////////////////////////////////////////////////////////////////////

Test.create(function (pragmatik, assert, it) {

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
        required: false,
      }
    ]
  });

  function foo(a, b, c, d) {
    return pragmatik.parse(arguments, r);
  }

  it('basic #1', t => {

    const [a, b, c, d] = foo('oh yes', t => {});
    assert.equal(a, 'oh yes');
    assert.equal(typeof b, 'undefined');
    assert.equal(c.name, '');

  });

  it('basic #1', t => {

    const [a, b, c, d] = foo('oh yes', {a: 'b'});

    assert.equal(a, 'oh yes');
    assert.equal(typeof b, 'object');
    assert.equal(c, undefined);

  });

  it('basic #2', t => {

    const [a, b, c, d] = foo('oh yes');
    assert.equal(a, 'oh yes');
    assert.equal(b, undefined);
    assert.equal(c, undefined);

  });

});

