const pragmatik = require('pragmatik');
const assert = require('assert');

const rules = pragmatik.signature({

  mode: 'strict', // does not allow two adjacent non-required types to be the same
  allowExtraneousTrailingVars: false,
  signatureDescription: '(s: string, opts?: Object, f: Array | Function)',
  args: [
    {
      type: 'string',
      default: function () {
        return '[suman-placeholder]';
      },
      required: false,
      errorMessage: function (r) {
        return 'First argument to describe/suite blocks must be a string description/title with a length greater than zero.\n' +
          'The signature is ' + r.signatureDescription;
      },
      checks: [
        function (val, rule) {
          assert(val.length > 0, rule.errorMessage);
        }
      ]
    },
    {
      type: 'object',
      required: false,
      errorMessage: function (r) {
        return 'Options object should be an object and not an array.' +
          'The signature is ' + r.signatureDescription;
      },
      default: function () {
        return {};
      },
      checks: [
        function (val, rule) {
          assert(typeof val === 'object' && !Array.isArray(val), rule.errorMessage +
            ', instead we got => ' + util.inspect(val));
        }
      ]
    },
    {
      type: 'array',
      required: false,
      errorMessage: function (r) {
        return 'Callback function is required for describe/suite blocks.' +
          'The signature is ' + r.signatureDescription;
      }

    },
    {
      type: 'function',
      required: false,
      errorMessage: function (r) {
        return 'Callback function is required for describe/suite blocks.' +
          'The signature is ' + r.signatureDescription;
      }
    }
  ]
});

const foo = function () {
  const [a, b, c, d] = pragmatik.parse(arguments, rules);
  return d(c);
};


const to = setTimeout(function(){
  process.exit(1);
}, 100);

foo(['bar'], function(v){
  clearTimeout(to);
  assert(v[0] === 'bar');
  process.exit(0);
});

