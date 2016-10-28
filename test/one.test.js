/**
 * Created by t_millal on 10/28/16.
 */


const pramatik = require('..');


const r = pramatik.validate({
    allowMoreArgs: false,
    parseToObject: true,
    allowExtraneousTrailingVars: false,
    args: [
        {
            type: 'string',
            required: false,
            allowNull: true,
            allowUndefined: true,
            checks: [function(arg){
                 return true;
            }]
        },

        {
            type: 'object',
            required: false,
            allowNull: true,
            allowUndefined: true,
            default: {}
        },

        {
            type: 'function',
            required: false,
            allowNull: true,
            allowUndefined: true,
            default: function noop() {
            }
        }

    ]
});


function foo(a, b, c) {

    const obj = pramatik.parse(arguments, r);
    console.log('obj =>', obj);

}


foo(function(err){

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