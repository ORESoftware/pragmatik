export interface IPragRetArg {
    name: 'string';
    value: Object;
}
export interface IPragRule {
    type: string;
    required: boolean;
    default?: Function;
    errorMessage: string;
    checks?: Array<Function>;
    postChecks?: Array<Function>;
}
export interface IPragRules {
    mode?: string;
    signatureDescription?: string;
    parseToObject?: boolean;
    allowExtraneousTrailingVars?: boolean;
    extraneousVarsErrorMessage?: string;
    args: Array<IPragRule>;
}
export interface IPragOpts {
    parseToObject?: boolean;
    preParsed?: boolean;
}
export interface IPragObjRet {
    [key: string]: any;
}
export declare function signature(r: IPragRules): IPragRules;
export declare function parse(argz: IArguments, r: IPragRules, $opts: IPragOpts): Object;
