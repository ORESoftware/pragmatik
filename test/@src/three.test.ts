'use strict';
const suman = require('suman');
const Test = suman.init(module);

////////////////////////////////////////////////////////////////////////

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
        required: true,
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

    const [a, b, c, d] = foo('oh yes', {a: 'b'});
    assert.equal(a, 'oh yes');
    assert.equal(typeof b, 'object');
    assert.equal(c, undefined);

  });
  
  it('basic #1', [t => {
    
    const [a, b, c, d] = foo('oh yes', {a: 'b'});
    assert.equal(a, 'oh yes');
    assert.equal(typeof b, 'object');
    assert.equal(c, undefined);
    
  }]);
  
  it('basic #1', [t => {
    
    const [a, b, c, d] = foo('oh yes', {a: 'b'});
    assert.equal(a, 'oh yes');
    assert.equal(typeof b, 'object');
    assert.equal(c, undefined);
    
  }]);

  it('basic #2',
    {throws: /rules dictate that there are more required args than those passed/},
    t => {
      const [a, b, c, d] = foo('oh yes');
    });

  it('basic #3',
    {throws: /Argument is required at argument index = 1, but type was wrong/},
    t => {
      const [a, b, c, d] = foo('oh yes', function gg() {
      });
    });

  it('basic #4', t => {

    const [a, b, c, d] = foo('oh yes', {u: 's'}, function a() {
    });

  });

  it('basic #5',
    {throws: /Argument is required at argument index = 1, but type was wrong. actual => "null". expected => "object"/},
    t => {
      const [a, b, c, d] = foo('oh yes', null, function a() {
      });
    });

});

