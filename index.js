'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const util = require("util");
const { lp } = require('log-prepend');
const log = {
    info: lp(' [pragmatik] ', process.stdout),
    error: lp(' [pragmatik error] ', process.stderr)
};
const okTypes = {
    'object': true,
    'array': true,
    'integer': true,
    'number': true,
    'string': true,
    'boolean': true,
    'function': true
};
const bannedTypes = {
    'undefined': true,
    'null': true
};
exports.signature = function (r) {
    assert(Array.isArray(r.args), ' => "Pragmatik" usage error => Please define an "args" array property in your definition object.');
    const errors = [];
    const args = r.args;
    args.forEach(function (item, index, arr) {
        if (bannedTypes[String(item.type).trim()]) {
            throw new Error('The following types cannot be used as a pragmatik type: ' + util.inspect(Object.keys(bannedTypes)));
        }
        if (!okTypes[String(item.type).trim()]) {
            throw new Error('Your item type is wrong or undefined, for rule => \n\n' + util.inspect(item)
                + '\n\nin the following definition => \n' + util.inspect(r));
        }
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
        if (index > 1) {
            if (!item.required) {
                let matched = false;
                let matchedIndex = null;
                let currentIndex = index - 2;
                while (currentIndex >= 0) {
                    let rule = args[currentIndex];
                    if (rule.type === item.type && !rule.required) {
                        matched = true;
                        matchedIndex = currentIndex;
                        break;
                    }
                    currentIndex--;
                }
                if (matched) {
                    currentIndex++;
                    let ok = false;
                    while (currentIndex < index) {
                        let rule = args[currentIndex];
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
};
const runChecks = function (arg, rule, retArgs) {
    let errors = [];
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
        throw new Error('Pragmatic usage error => "checks" property should be an array => ' + util.inspect(rule));
    }
    if (errors.length) {
        throw new Error(errors.join('\n\n'));
    }
};
const getSignatureDesc = function (r) {
    return r.signatureDescription ? (' => The function signature is => ' + r.signatureDescription) : '';
};
const getErrorMessage = function (a, argType, rulesType, msg) {
    return [
        'Missing required argument',
        `Argument is required at argument index = ${a}, but type was wrong`,
        'actual => "' + argType + '"',
        'expected => "' + rulesType + '"',
        '.'
    ];
};
exports.parse = function (argz, r, opts) {
    const preParsed = opts === true || Boolean(opts && opts.preParsed);
    const args = Array.from(argz);
    if (preParsed) {
        return args;
    }
    const rules = r.args;
    const argsLengthGreaterThanRulesLength = args.length > rules.length;
    let argsLengthGreaterThanOrEqualToRulesLength = args.length >= rules.length;
    if (argsLengthGreaterThanRulesLength && r.allowExtraneousTrailingVars === false) {
        throw new Error('Usage error from "pragmatik" library => arguments length is greater than length of rules array,' +
            ' and "allowExtraneousTrailingVars" is explicitly set to false.');
    }
    const requiredLength = rules.filter(item => item.required).length;
    if (requiredLength > args.length) {
        throw new Error('"Pragmatic" rules dictate that there are more required args than those passed to function. ' +
            'Expected minimum number of arguments: ' + requiredLength + '. Actual number of arguments: ' + args.length + '. ' +
            (r.signatureDescription ? 'The function signature is: ' + r.signatureDescription : ''));
    }
    const retArgs = [];
    let a = 0, argsOfA;
    while (retArgs.length < rules.length || args[a]) {
        argsLengthGreaterThanOrEqualToRulesLength = args.length >= rules.length;
        argsOfA = args[a];
        let argType = String(typeof argsOfA).trim().toLowerCase();
        if (argType === 'object' && Array.isArray(argsOfA)) {
            argType = 'array';
        }
        else if (argType === 'object' && argsOfA === null) {
            argType = 'null';
        }
        else if (argType === 'number' && Number.isInteger(argsOfA)) {
            argType = 'integer';
        }
        let currentRule = rules[a];
        if (!currentRule) {
            if (r.allowExtraneousTrailingVars === false) {
                throw new Error(`Extraneous variable passed for index => ${a} => with value ${args[a]} ` + getSignatureDesc(r));
            }
            else {
                retArgs.push(argsOfA);
                a++;
                continue;
            }
        }
        let rulesType = currentRule.type;
        if (rulesType === argType) {
            runChecks(args[a], currentRule, retArgs);
            retArgs.push(argsOfA);
        }
        else if (a > retArgs.length) {
            if (r.allowExtraneousTrailingVars === false) {
                throw new Error(`Extraneous variable passed for index => ${a} => with value ${argsOfA}.`);
            }
            retArgs.push(argsOfA);
        }
        else if (currentRule.required) {
            let errMsg = currentRule.errorMessage;
            let msg = typeof errMsg === 'function' ? errMsg(r) : (errMsg || '');
            throw new Error(getErrorMessage(a, argType, rulesType, msg).join('. '));
        }
        else {
            if (r.allowExtraneousTrailingVars === false && (retArgs.length > (rules.length - 1)) && argsOfA) {
                throw new Error('Extraneous variable passed => ' + util.inspect(argsOfA));
            }
            if (argsLengthGreaterThanOrEqualToRulesLength) {
                if (argsOfA !== undefined && argsOfA !== null) {
                    let errMsg = currentRule.errorMessage;
                    let msg = typeof errMsg === 'function' ? errMsg(r) : (errMsg || '');
                    log.error('Argument is *not* required at argument index = ' + a +
                        ', but type was wrong => expected => "'
                        + rulesType + '" => actual => "' + argType + '"');
                    throw new Error(msg);
                }
            }
            else {
                if (argsOfA !== null) {
                    args.splice(a, 0, undefined);
                }
            }
            let fn = currentRule.default;
            let deflt = argsOfA === null ? null : undefined;
            if (typeof fn === 'function') {
                deflt = fn();
            }
            else if (fn) {
                throw new Error('Pragmatik usage error => "default" property should be undefined or a function.');
            }
            retArgs.push(deflt);
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
    return retArgs;
};
