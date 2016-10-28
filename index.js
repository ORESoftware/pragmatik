/**
 * Created by t_millal on 10/28/16.
 */

//core
const assert = require('assert');
const util = require('util');

const fnargs = require('function-arguments');


function validate(obj) {
    return obj;
}

function getUniqueArrayOfStrings(a) {
    return a.filter(function (item, i, ar) {
            return ar.indexOf(item) === i;
        }).length === a.length;
}


function parse(argz, r) {

    const callee = argz.callee;
    assert(typeof callee === 'function', 'To use "pragmatik", please pass the arguments object.');

    const args = Array.prototype.slice.call(argz); //should work if args is arguments type or already an array

    console.log('original args:', args);  /// logging

    const rules = r.args;

    const parseToObject = !!r.parseToObject;

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
            const rulesType = rules[z].type;

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