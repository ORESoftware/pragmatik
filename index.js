/**
 * Created by t_millal on 10/28/16.
 */

//core
const assert = require('assert');
const util = require('util');

//npm
const fnargs = require('function-arguments');

//project
const types = [
    'object',
    'array',
    'integer',
    'number',
    'string',
    'boolean',
    'null',
    'undefined',
    'function'
];

function validate(r) {

    assert(Array.isArray(r.args), ' => "Pragmatik" usage error => Please define an "args" array property in your definition object.');
    const errors = [];
    const args = r.args;

    args.forEach(function (item, index, arr) {

        assert(types.indexOf(item.type) >= 0, 'Your item type is wrong or undefined, for rule => \n\n' + util.inspect(item)
            + '\n\nin the following definition => \n' + util.inspect(r) + '\n\n');

        //check to see if two adjacent items of the same type are both required
        if (index > 0) {
            const prior = arr[index - 1];
            const priorRequired = prior.required;
            if (!priorRequired) {
                if (prior.type === item.type) {
                    errors.push('Two adjacent fields are of the same type, and the preceding argument' +
                        '(leftmost) is not required which is problematic => '
                        + '\n => arg index => ' + (index - 1) + ' => ' + util.inspect(prior)
                        + '\n => arg index => ' + index + ' => ' + util.inspect(item));
                }
            }
        }

        //check to see that if something like "string object string", to make sure object is required
        // if both strings are not required
        //or more generally check to see that if something like "string object function string",
        // to make sure both object and function are required

        if (index > 1) {

            if (!item.required) {

                var matched = false;
                var matchedIndex = null;
                var currentIndex = index - 2;
                while (currentIndex >= 0) {
                    const rule = args[currentIndex];
                    if (rule.type === item.type && !rule.required) {
                        matched = true;
                        matchedIndex = currentIndex;
                        break;
                    }
                    currentIndex--;
                }

                if (matched) {
                    currentIndex++;  //simply bump it up by 1, once
                    var ok = false;
                    while (currentIndex < index) {
                        const rule = args[currentIndex];
                        if (rule.required) {
                            ok = true; // at least one required "other-type" is in-between the two same types
                            break;
                        }
                        currentIndex++;
                    }

                    if (!ok) {
                        errors.push('Two non-adjacent non-required arguments of the same type are' +
                            ' not separated by required arguments => '
                            + '\n => arg index => ' + matchedIndex + ' => ' + util.inspect(args[matchedIndex])
                            + '\n => arg index => ' + index + ' => ' + util.inspect(item));
                    }
                }
            }

        }


    });

    if (errors.length) {
        throw new Error(errors.map(e => (e.stack || e)).join('\n\n'));
    }

    return r;
}

function getUniqueArrayOfStrings(a) {
    return a.filter(function (item, i, ar) {
            return ar.indexOf(item) === i;
        }).length === a.length;
}


function parse(argz, r, $parseToObject) {

    const callee = argz.callee;
    assert(typeof callee === 'function', 'To use "pragmatik", please pass the arguments object to pragmatik.parse()');

    const args = Array.prototype.slice.call(argz); //should work if args is arguments type or already an array

    console.log('\n\n', 'original args:\n', args, '\n\n');  /// logging

    const rules = r.args;
    const parseToObject = $parseToObject === true || !!r.parseToObject;

    console.log('parseToObject =>', parseToObject);

    var argNames, ret;

    if (parseToObject) {
        argNames = fnargs(callee);
        assert(getUniqueArrayOfStrings(argNames), ' => "Pragmatik" usage error => You have duplicate argument names, ' +
            'or otherwise you need to name all your arguments so they match your rules, and are same length.');
        ret = {};
    }

    if (args.length > rules.length && rules.allowMoreArgs !== true) {
        throw new Error('=> Usage error from "pragmatik" library => arguments length is greater than length of rules.');
    }
    else if (args.length > rules.length) {
        throw new Error('Not implemented yet.');
    }

    if (args.length === rules.length) {

        for (let i = 0; i < args.length; i++) {
            assert(typeof args[i] === rules[i].type,
                'Type of argument does not match rule at argument index = ' + i +
                '\n\n => actual => "' + typeof args[i] + '" => '+ util.inspect(args[i]) +
                '\n\n => expected => ' + util.inspect(rules[i]));
        }

        if (parseToObject) {
            for (let i = 0; i < args.length; i++) {
                ret[argNames[i]] = args[i];
            }
            return ret;
        }
        else {
            return args;
        }
    }

    else {

        const requiredLength = rules.filter(item => item.required);
        if (requiredLength > args.length) {
            throw new Error('"Pragmatic" rules dicate that there are more required args than those passed to function.');
        }

        const retArgs = [];
        // using "a" as var name makes debugging easier because it appears at the top of debugging console
        var a = 0;

        while (retArgs.length < rules.length) {

            const argType = typeof args[a];
            const rulesTemp = rules[a];
            const rulesType = rulesTemp.type;

            if (rulesType === argType) {
                if (parseToObject) {
                    retArgs.push({
                        name: argNames[a],
                        value: args[a]
                    });
                }
                else {
                    retArgs.push(args[a]);
                }

            }
            else if (a > retArgs.length) {

                if (r.allowExtraneousTrailingVars === false) {
                    throw new Error('Extraneous variable passed for => ' + argNames[a]);
                }

                if (parseToObject) {
                    retArgs.push({
                        name: argNames[a],
                        value: undefined
                    });
                }
                else {
                    retArgs.push(undefined);
                }

            }
            else if (!rules[a].required) {

                let rulesLengthMinusOne = rules.length - 1;

                if (r.allowExtraneousTrailingVars === false && (a > rulesLengthMinusOne) && args[a]) {
                    throw new Error('Extraneous variable passed for => "' + argNames[a] + '" => ' + util.inspect(args[a]));
                }


                args.splice(a, 0, undefined);


                if (parseToObject) {
                    retArgs.push({
                        name: argNames[a],
                        value: args[a]
                    });
                }
                else {
                    retArgs.push(args[a]);
                }
            }
            else {
                throw new Error('Argument is required at argument index = ' + a + ', but type was wrong \n => expected => "' + rulesType + '"\n => actual => "' + argType + '"');
            }

            a++;
        }


        if (parseToObject) {
            retArgs.forEach(function (item) {
                ret[item.name] = item.value;
            });
            return ret;
        }

        return retArgs;
    }


}


module.exports = {
    parse: parse,
    validate: validate
};