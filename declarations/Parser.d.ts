export declare class Parser {
    static parseToGetter(exp: string): any;
    static parseToSetter(exp: string): any;
    static hasInterpolation(str: string): boolean;
    static parseInterpolationToGetter(expression: string): any;
    static parseToFunction(exp: string): any;
}
