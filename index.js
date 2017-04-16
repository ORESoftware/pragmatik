'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var util = require("util");
var debug = require('debug')('pragmatik');
var fnargs = require('function-arguments');
var types = [
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
function signature(r) {
    assert(Array.isArray(r.args), ' => "Pragmatik" usage error => Please define an "args" array property in your definition object.');
    var errors = [];
    var args = r.args;
    args.forEach(function (item, index, arr) {
        assert(types.indexOf(item.type) >= 0, 'Your item type is wrong or undefined, for rule => \n\n' + util.inspect(item)
            + '\n\nin the following definition => \n' + util.inspect(r) + '\n\n');
        if (index > 0) {
            var prior = arr[index - 1];
            var priorRequired = prior.required;
            if (!priorRequired) {
                if (prior.type === item.type) {
                    errors.push('Two adjacent fields are of the same type, and the preceding argument' +
                        '(leftmost) is not required which is problematic => '
                        + '\n => arg index => ' + (index - 1) + ' => ' + util.inspect(prior)
                        + '\n => arg index => ' + index + ' => ' + util.inspect(item));
                }
            }
        }
        if (index > 1) {
            if (!item.required) {
                var matched = false;
                var matchedIndex = null;
                var currentIndex = index - 2;
                while (currentIndex >= 0) {
                    var rule = args[currentIndex];
                    if (rule.type === item.type && !rule.required) {
                        matched = true;
                        matchedIndex = currentIndex;
                        break;
                    }
                    currentIndex--;
                }
                if (matched) {
                    currentIndex++;
                    var ok = false;
                    while (currentIndex < index) {
                        var rule = args[currentIndex];
                        if (rule.required) {
                            ok = true;
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
        throw new Error(errors.join('\n\n'));
    }
    return r;
}
exports.signature = signature;
function getUniqueArrayOfStrings(a) {
    return a.filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
    }).length === a.length;
}
function runChecks(arg, rule, retArgs) {
    var errors = [];
    if (Array.isArray(rule.checks)) {
        rule.checks.forEach(function (fn) {
            try {
                fn.apply(null, [arg, rule, retArgs]);
            }
            catch (err) {
                errors.push(err.stack || err);
            }
        });
    }
    else if (rule.checks) {
        throw new Error(' => Pragmatic usage error => "checks" property should be an array => ' + util.inspect(rule));
    }
    if (errors.length) {
        throw new Error(errors.join('\n\n\n'));
    }
}
function parse(argz, r, $opts) {
    var opts = $opts || {};
    var $parseToObject = !!opts.parseToObject;
    var preParsed = !!opts.preParsed;
    var args = Array.from(argz);
    if (preParsed) {
        return args;
    }
    debug('\n\n', 'original args => \n', args, '\n\n');
    var rules = r.args;
    var parseToObject = $parseToObject === true || !!r.parseToObject;
    var argNames, ret;
    if (parseToObject) {
        var callee = argz.callee;
        assert(typeof callee === 'function', 'To use "pragmatik" with "parseToObject" option set to true,' +
            ' please pass the arguments object to pragmatik.parse(), [this may not work in strict mode].');
        argNames = fnargs(callee);
        assert(getUniqueArrayOfStrings(argNames), ' => "Pragmatik" usage error => You have duplicate argument names, ' +
            'or otherwise you need to name all your arguments so they match your rules, and are same length.');
        ret = {};
    }
    var argsLengthGreaterThanRulesLength = args.length > rules.length;
    var argsLengthGreaterThanOrEqualToRulesLength = args.length >= rules.length;
    if (argsLengthGreaterThanRulesLength && r.allowExtraneousTrailingVars === false) {
        throw new Error('=> Usage error from "pragmatik" library => arguments length is greater than length of rules array,' +
            ' and "allowExtraneousTrailingVars" is explicitly set to false.');
    }
    var requiredLength = rules.filter(function (item) { return item.required; }).length;
    if (requiredLength > args.length) {
        throw new Error('"Pragmatic" rules dictate that there are more required args than those passed to function.');
    }
    var retArgs = [];
    var a = 0;
    var argsOfA;
    while (retArgs.length < rules.length || args[a]) {
        argsOfA = args[a];
        var argType = typeof argsOfA;
        if (argType === 'object' && Array.isArray(argsOfA)) {
            argType = 'array';
        }
        else if (argType === 'object' && argsOfA === null) {
            argType = 'null';
        }
        var rulesTemp = rules[a];
        if (!rulesTemp) {
            if (r.allowExtraneousTrailingVars === false) {
                throw new Error('Extraneous variable passed for index => ' + a + ' => with value ' + args[a] + '\n' +
                    (r.signatureDescription ? ('The function signature is => ' + r.signatureDescription) : ''));
            }
            else {
                retArgs.push(argsOfA);
                a++;
                continue;
            }
        }
        var rulesType = rulesTemp.type;
        if (rulesType === argType) {
            runChecks(args[a], rulesTemp, retArgs);
            if (parseToObject) {
                retArgs.push({
                    name: argNames[a],
                    value: argsOfA
                });
            }
            else {
                retArgs.push(argsOfA);
            }
        }
        else if (a > retArgs.length) {
            if (r.allowExtraneousTrailingVars === false) {
                throw new Error('Extraneous variable passed for index => ' + a + ' => with value ' + args[a]);
            }
            if (parseToObject) {
                retArgs.push({
                    name: argNames[a],
                    value: argsOfA
                });
            }
            else {
                retArgs.push(argsOfA);
            }
        }
        else if (!rulesTemp.required) {
            if (r.allowExtraneousTrailingVars === false && (retArgs.length > (rules.length - 1)) && args[a]) {
                throw new Error('Extraneous variable passed for => "' + argNames[a] + '" => ' + util.inspect(args[a]));
            }
            if (argsLengthGreaterThanOrEqualToRulesLength) {
                if (argsOfA !== undefined) {
                    var errMsg = rulesTemp.errorMessage;
                    var msg = typeof errMsg === 'function' ? errMsg(r) : (errMsg || '');
                    throw new Error(msg + '\nArgument is *not* required at argument index = ' + a +
                        ', but type was wrong \n => expected => "'
                        + rulesType + '"\n => actual => "' + argType + '"');
                }
            }
            else {
                args.splice(a, 0, undefined);
            }
            var fn = rulesTemp.default;
            var deflt = undefined;
            if (fn && typeof fn !== 'function') {
                throw new Error(' => Pragmatik usage error => "default" property should be undefined or a function.');
            }
            else if (fn) {
                deflt = fn();
            }
            if (parseToObject) {
                retArgs.push({
                    name: argNames[a],
                    value: deflt
                });
            }
            else {
                retArgs.push(deflt);
            }
        }
        else {
            var errMsg = rulesTemp.errorMessage;
            var msg = typeof errMsg === 'function' ? errMsg(r) : (errMsg || '');
            throw new Error(msg + '\nArgument is required at argument index = ' + a + ', ' +
                'but type was wrong \n => expected => "'
                + rulesType + '"\n => actual => "' + argType + '"');
        }
        a++;
    }
    rules.forEach(function (r, index) {
        if (r.postChecks) {
            r.postChecks.forEach(function (fn) {
                fn.call(null, index, retArgs);
            });
        }
    });
    if (parseToObject) {
        retArgs.forEach(function (item) {
            ret[item.name] = item.value;
        });
        return ret;
    }
    return retArgs;
}
exports.parse = parse;
