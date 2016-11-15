
# PRAGMATIK

This library attempts to solve an age-old problem in JavaScript => how do we parse the arguments inside a function
that accepts a variable number of arguments? (See "variadic functions" and "varargs"). 

### Disclaimer, Pragmatik library is in beta

This library allows you to elegantly parse arguments at runtime and assign them to the 
correct variable in the function signature, according to the parsing rules you define.
It is most useful for APIs where we want to give our users the convenience of omitting variables,
and not requiring them to pass ```null``` or other placeholder values.

## Basic Usage

The following is a function that accepts varargs:

```js
const pragmatik = require('pragmatik');

function foo(){
 const [a,b,c,d,e] = pragmatik.parse(arguments, rules);
  
}
```

if you want better IDE support, you can do this, but it's fairly unnecessary:

```js
function foo(a,b,c,d,e){
 var [a,b,c,d,e] = pragmatik.parse(arguments, rules);
  
}
```

The rules variable, looks like this:

```js
 const rules =  pragmatik.signature({

    mode: 'strict',                         // does not allow two adjacent non-required types to be the same
    allowExtraneousTrailingVars: false,
    signatureDescription: '(String s, [Object opts,] Function f)',
    args: [
      {
        type: 'string',
        required: true,
        errorMessage: function(r){
          return 'your unique error message';
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
        errorMessage: function(r){
          return 'your unique error message.'
        },
        default: function(){
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
        type: 'function',
        required: true,
        errorMessage: function(r){
          return 'your unique error message.';
        }
      }
    ]
  }),
  ```



# Motivation

As JS is a dynamic language, we can omit arguments completely and still call functions.

For example,

```js
function foo(a,b,c){

}
```

we can call foo without any arguments at all:

```js
foo();
```

and this is valid, of course. But in statically typed languages, this probably won't even compile, let alone run :)

So, what if argument a is "optional", but b and c are "required"?

foo might look like:

```js
function foo(a,b,c){
  a = a || 'temp';
  // yadda yadda
  console.log('a:',a,', b:',b,', c:',c);
}
```

if we call foo like this:

foo('this is b', 'this is c');

then of course, we will get:

```a: this is b , b: this is c , c: undefined```

Which is totally incorrect, according to our intentions. And the problem only gets
worse in more complicated function calls.

We could solve this, by requiring users to always pass 3 arguments, no more, no less, which would be:

foo(null, 'this is b', 'this is c');

But what if we want to make our APIs as beautiful as possible and give our users the convenience of omitting
variables?

**Enter pragmatik.**



## Advanced usage


Pragmatik first validates your rules object, to make sure the rules you define are valid according to the way
this library works. Parsing varargs is more difficult than you might think at first, and you have to settle 
on a good strategy.

Pragmatik uses types ('function','object','string') as a building block for determining if you passed in the 
expected variable at the given argument index.