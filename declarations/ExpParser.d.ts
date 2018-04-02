export declare class ExpParser {
    private static normalExpGetter;
    private static interpolationExpGetter;
    static registerParsedExp(map: {
        normal: {
            [exp: string]: Function;
        };
        interpolation: {
            [exp: string]: Function;
        };
    }): void;
    static parseNormalExp(expression: string): Function;
    static parseInterpolationExp(expression: string): Function;
    static hasInterpolation(str: string): boolean;
}
