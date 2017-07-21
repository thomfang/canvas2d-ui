export declare class WeakRef {
    private static weakRefTable;
    static set(ref: string, source: any, target: any): void;
    static get(ref: string, source: any): any;
    static remove(ref: string, source: any): void;
    static clear(source: any): void;
}
