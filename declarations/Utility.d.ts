export declare class Utility {
    private static UID_OF_NAN;
    private static UID_OF_NULL;
    private static UID_OF_TRUE;
    private static UID_OF_FALSE;
    private static UID_OF_UNDEFINED;
    private static isUidInited;
    static log(...args: any[]): void;
    static error(...args: any[]): any;
    static warn(...args: any[]): any;
    static getUid(target: any): number;
    private static getObjectUid(target);
    static isNewValueAnObjectOrNotEqualOldValue(a: any, b: any): any;
    static isPlainObjectOrObservableObject(target: any): boolean;
    static removeItemFromArray(item: any, arr: any[]): void;
    static addEnsureUniqueArrayItem(item: any, arr: any[]): void;
    static createProxy(target: object, property: string, source: object): boolean;
    static hasProxy(target: any, property: string): boolean;
    static deepClone(target: any): any;
    static queryStringToObject(str: string): {
        [key: string]: any;
    };
    static objToQueryString(obj: Object): string;
    static getFilePath(path: string): string;
    private static nextTickCallbacks;
    private static nextTickHandle;
    static nextTick(callback: Function, thisObject?: any): void;
}
