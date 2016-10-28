/**
 * Created by t_millal on 10/28/16.
 */

//core
const assert = require('assert');
const util = require('util');

const fnargs = require('function-arguments');


function validate(r) {

    assert(Array.isArray(r.args), ' => "Pragmatik" usage error => Please define a rules array property in your rules object.');
    const errors = [];
    const args = r.args;
    args.forEach(function (item, index, arr) {

        //check to see if two adjacent items of the same type are both required
        if (index > 0) {
            const prior = arr[index - 1];
            const priorRequired = prior.required;
            if (!priorRequired && !item.required) {
                if (prior.type === item.type) {
                    errors.push('Two adjacent fields that are not both required have the same type => '
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
                    while (currentIndex < index - 1) {
                        const rule = args[currentIndex];
                        if (!rule.required) {
                            errors.push('Two non-adjacent non-required arguments of the same type are' +
                                ' not separated by required arguments => '
                                + '\n => arg index => ' + matchedIndex + ' => ' + util.inspect(args[matchedIndex])
                                + '\n => arg index => ' + index + ' => ' + util.inspect(item));
                            break;
                        }
                        currentIndex++;
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

    console.log('original args:', args);  /// logging

    const rules = r.args;
    const parseToObject = $parseToObject === true || !!r.parseToObject;

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
            assert(typeof args[i] === rules[i].type);
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
        var z = 0;

        while (retArgs.length < rules.length) {

            const argType = typeof args[z];
            const rulesTemp = rules[z];
            const rulesType = rulesTemp.type;

            if (rulesType === argType) {
                if (parseToObject) {
                    retArgs.push({
                        name: argNames[z],
                        value: args[z]
                    });
                }
                else {
                    retArgs.push(retArgs);
                }

            }
            else if (z > retArgs.length) {

                if (r.allowExtraneousTrailingVars === false) {
                    throw new Error('Extraneous variable passed for => ' + argNames[z]);
                }

                if (parseToObject) {
                    retArgs.push({
                        name: argNames[z],
                        value: undefined
                    });
                }
                else {
                    retArgs.push(undefined);
                }

            }
            else if (!rules[z].required) {

                let rulesLengthMinusOne = rules.length - 1;

                if (r.allowExtraneousTrailingVars === false && (z > rulesLengthMinusOne) && args[z]) {
                    throw new Error('Extraneous variable passed for => "' + argNames[z] + '" => ' + util.inspect(args[z]));
                }

                args.splice(z, 0, undefined);

                if (parseToObject) {
                    retArgs.push({
                        name: argNames[z],
                        value: undefined
                    });
                }
                else {
                    retArgs.push(undefined);
                }
            }
            else {
                throw new Error('Argument is required at argument index = ' + z + ', but type was wrong \n => expected => "' + rulesType + '"\n => actual => "' + argType + '"');
            }

            z++;
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