/**
 * Created by t_millal on 10/28/16.
 */


const pragmatik = require('../..');


const r = pragmatik.validate({
    mode: 'strict', // does not allow two adjacent non-required types to be the same
    allowMoreArgs: false,
    parseToObject: true,
    allowExtraneousTrailingVars: false,
    args: [
        {
            type: 'string',
            required: false,
            checks: [function (arg) {  //check to see if the object has a certain constructor or what not
                return true;
            }]
        },
        {
            type: 'object',
            required: true,
        },

        {
            type: 'function',
            required: false
        },
        {
            type: 'object',
            required: false,
        },

    ]
});


function foo(a, b, c) {

    var {a, b, c} = pragmatik.parse(arguments, r);


    console.log('a =>', a);
    console.log('b =>', b);
    console.log('c =>', c);

}


foo({a:'b'},function (err) {

});


// foo('first', function(err){
//
//     console.log('a is done');
//
// });

//
// foo('first', {}, function(err){
//
//     console.log('a is done');
//
// });