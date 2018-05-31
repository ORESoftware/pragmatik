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
    allowExtraneousTrailingVars?: boolean;
    extraneousVarsErrorMessage?: string;
    args: Array<IPragRule>;
}
export interface IPragOpts {
    preParsed?: boolean;
}
export interface IPragObjRet {
    [key: string]: any;
}
export declare const signature: (r: IPragRules) => IPragRules;
export declare const parse: (argz: IArguments, r: IPragRules, opts: IPragOpts) => Object;
