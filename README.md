
# PRAGMATIK

This library attempts to solve an age-old problem in JavaScript => how do we parse the arguments inside a function
that accepts a variable number of arguments? (See "variadic functions" and "varargs"). I have seen so many people roll their 
own solution to this problem. At best we get bad error messages or no error messages. At worst, we end up with runtimes using the 
wrong values, until something breaks, or worse until something succeeds. Pragmatik is design to fail-fast => if your rules are not valid,
an error is thrown and if any function cannot be parsed successfully given the runtime arguments and the parsing rules, an error is thrown.

### Disclaimer => the Pragmatik library is in beta

This library allows you to elegantly parse arguments at runtime and assign them to the 
correct/expected variable in the function signature, according to the parsing rules you define.
It is most useful for public and private APIs where we want to give our users the convenience of omitting variables,
and not requiring them to pass ```null``` or other placeholder values. Of course, you should design your APIs well,
with simple function calls with limited number of variation in the signature. Using options objects is a great
design pattern to keep things simple, but at some point variadic functions become convenient and we must handle 
them well, without writing buggy code that will fail silently in edge cases.

Extensive testing needs to be completed before this library is totally proven. Also need some sanity checks to make sure this is exactly what people
need and want. We will incorporate other "types" that can be easily and reliably checked, like 'array'. 
Unfortunately, type checking beyond simple primitive types is not an effective strategy because you don't know whether the user passed 
in the argument in the wrong place in the signature or if they passed the wrong value for the right argument.

## Basic Usage

The following is a function that accepts varargs, and we use Pragmatik to parse the arguments:

```js
const pragmatik = require('pragmatik');

function foo(){
 const [a,b,c,d,e] = pragmatik.parse(arguments, rules);
  
}
```

so we can call foo above, like so:

```foo(true, {zim:'zam'}, function(){});```

and Pragmatik can be used to parse the values as they are expected to appear, for example:

```js
const pragmatik = require('pragmatik');

const r = pragmatik.signature({

    mode: 'strict',                        // does not allow two adjacent non-required types to be the same
    allowExtraneousTrailingVars: false,
    args: [
      {
        type: 'string',
        required: false,
      },
      {
        type: 'boolean',
        required: true,
      },
      {
        type: 'object',
        required: true,
      },
      {
        type: 'boolean',
        required: false,
      },
      {
        type: 'function',
        required: false,
      }
    ]
 });


function foo(){
 const [a,b,c,d,e] = pragmatik.parse(arguments, rules);
 
 console.log(a,b,c,d,e); 
 // a => undefined
 // b => true
 // c => {zim:'zam'}
 // d => undefined
 // e => function(){}
 
}
```

if you want better IDE support, you can do this, but it's fairly unnecessary:

```js
function foo(a,b,c,d,e){
 var [a,b,c,d,e] = pragmatik.parse(arguments, rules);
  
}
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