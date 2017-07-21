export declare class ObservableArray {
    static extendedPrototype: any;
    static setAt<T>(array: Array<T>, index: number, value: T): void;
    static removeAt<T>(array: Array<T>, index: number): T;
    static removeByItem<T>(array: Array<T>, value: any): void;
    static removeAllByItem<T>(array: Array<T>, value: any): void;
}
