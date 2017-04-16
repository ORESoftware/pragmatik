export declare namespace prag {
    interface RetArg {
        name: 'string';
        value: Object;
    }
    interface Rule {
        type: string;
        required: boolean;
        default?: Function;
        errorMessage: string;
        checks?: Array<Function>;
        postChecks?: Array<Function>;
    }
    interface Rules {
        mode?: string;
        signatureDescription?: string;
        parseToObject?: boolean;
        allowExtraneousTrailingVars?: boolean;
        extraneousVarsErrorMessage?: string;
        args: Array<Rule>;
    }
    interface Opts {
        parseToObject?: boolean;
        preParsed?: boolean;
    }
    interface ObjectRet {
        [key: string]: any;
    }
}
export declare function signature(r: prag.Rules): prag.Rules;
export declare function parse(argz: IArguments, r: prag.Rules, $opts: prag.Opts): Object;
