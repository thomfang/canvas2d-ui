export declare class Parser {
    private static getterMap;
    private static setterMap;
    private static interpolationMap;
    static parseToGetter(exp: string): any;
    static parseToSetter(exp: string): any;
    static hasInterpolation(str: string): boolean;
    static parseInterpolationToGetter(expression: string): any;
    static parseToFunction(exp: string): any;
}
