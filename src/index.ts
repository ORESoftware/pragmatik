'use strict';

//core
import assert = require('assert');
import util = require('util');

//npm
import chalk = require('chalk');
const {lp} = require('log-prepend');

const log = {
  info: lp(' [pragmatik] ', process.stdout),
  error: lp(' [pragmatik error] ', process.stderr)
};

//project
const okTypes = <any> {
  'object': true,
  'array': true,
  'integer': true,
  'number': true,
  'string': true,
  'boolean': true,
  'function': true
};

const bannedTypes = <any>{
  'undefined': true,
  'null': true
};

export interface IPragRetArg {
  name: 'string',
  value: Object
}

export interface IPragRule {
  type: string,
  required: boolean,
  default?: Function,
  errorMessage: string,
  checks?: Array<Function>,
  postChecks?: Array<Function>
}

export interface IPragRules {
  mode?: string,
  signatureDescription?: string,
  allowExtraneousTrailingVars?: boolean,
  extraneousVarsErrorMessage?: string,
  args: Array<IPragRule>
}

export interface IPragOpts {
  preParsed?: boolean
}

export interface IPragObjRet {
  [key: string]: any;
}

export const signature = function (r: IPragRules) {
  
  assert(Array.isArray(r.args), ' => "Pragmatik" usage error => Please define an "args" array property in your definition object.');
  const errors: Array<string> = [];
  const args: Array<IPragRule> = r.args;
  
  args.forEach(function (item, index, arr) {
    
    if (bannedTypes[String(item.type).trim()]) {
      throw new Error('The following types cannot be used as a pragmatik type: ' + util.inspect(Object.keys(bannedTypes)));
    }
    
    if (!okTypes[String(item.type).trim()]) {
      throw new Error('Your item type is wrong or undefined, for rule => \n\n' + util.inspect(item)
        + '\n\nin the following definition => \n' + util.inspect(r))
    }
    
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
    
    // check to see that if something like "string object string", to make sure object is required
    // if both strings are not required
    // or more generally check to see that if something like "string object function string",
    // to make sure both object and function are required
    
    if (index > 1) {
      
      if (!item.required) {
        
        let matched = false;
        let matchedIndex: number = null;
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
          currentIndex++;  //simply bump it up by 1, once
          let ok = false;
          while (currentIndex < index) {
            let rule = args[currentIndex];
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
    throw new Error(errors.join('\n\n'));
  }
  
  return r;
};

const runChecks = function (arg: Object, rule: IPragRule, retArgs: Array<Object>): void {
  
  let errors: Array<string> = [];
  
  if (Array.isArray(rule.checks)) {
    rule.checks.forEach(function (fn: Function) {
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

const getSignatureDesc = function (r: IPragRules) {
  return r.signatureDescription ? (' => The function signature is => ' + r.signatureDescription) : '';
};

const getErrorMessage = function(a: number, argType: string, rulesType: string, msg: string) : Array<string>{
  return [
    'Missing required argument',
    `Argument is required at argument index = ${a}, but type was wrong`,
    'actual => "' + argType + '"',
    'expected => "' + rulesType + '"',
    '.'
  ];
};

///////////////////////////////////////////////////////////////////////////////////////////////

export const parse = function (argz: IArguments, r: IPragRules, opts: IPragOpts): Object {
  
  const preParsed = opts === true || Boolean(opts && opts.preParsed);
  //the following should work if args is arguments type or already an array
  const args = Array.from(argz);
  
  if (preParsed) {
    return args;
  }
  
  const rules: Array<IPragRule> = r.args;
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
  
  const retArgs: Array<Object> = [];
  // using "a" as let name makes debugging easier because it appears at the top of debugging console
  let a = 0, argsOfA: any;
  
  while (retArgs.length < rules.length || args[a]) {  //args[a] may be undefined
    
    argsLengthGreaterThanOrEqualToRulesLength = args.length >= rules.length;
    argsOfA = args[a];
    
    let argType: string = String(typeof argsOfA).trim().toLowerCase();
    if (argType === 'object' && Array.isArray(argsOfA)) {
      argType = 'array';
    }
    else if (argType === 'object' && argsOfA === null) {
      argType = 'null';
    }
    else if (argType === 'number' && Number.isInteger(argsOfA as number)) {
      argType = 'integer';
    }
    
    let currentRule = rules[a];
    
    if (!currentRule) { // in the case that a > rulesTemp.length - 1
      if (r.allowExtraneousTrailingVars === false) {
        throw new Error(`Extraneous variable passed for index => ${a} => with value ${args[a]} ` + getSignatureDesc(r));
      }
      else {
        retArgs.push(argsOfA);
        a++;
        continue;
      }
    }
    
    let rulesType: string = currentRule.type;
    
    if (rulesType === argType) {
      
      //if the type matches, then let's run the validation checks
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
      
      // the argument is required, but it's the wrong type
      let errMsg = currentRule.errorMessage as any;
      let msg = typeof errMsg === 'function' ? errMsg(r) : (errMsg || '');
      throw new Error(getErrorMessage(a, argType, rulesType, msg).join('. '));
      
    }
    else {
      
      // have to compare against rules.length - 1, not rules.length because we haven't pushed to the array yet
      if (r.allowExtraneousTrailingVars === false && (retArgs.length > (rules.length - 1)) && argsOfA) {
        throw new Error('Extraneous variable passed => ' + util.inspect(argsOfA));
      }
      
      if (argsLengthGreaterThanOrEqualToRulesLength) {
        
        if (argsOfA !== undefined && argsOfA !== null) {
          let errMsg = currentRule.errorMessage as any;
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
      
      let deflt: Object = argsOfA === null ? null : undefined;  //this assignment is necessary to reassign for each loop
      
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
      r.postChecks.forEach(function (fn: Function) {
        fn.call(null, index, retArgs);
      })
    }
  });
  
  return retArgs;
  
};
