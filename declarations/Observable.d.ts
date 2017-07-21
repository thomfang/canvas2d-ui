import { Observer } from './Observer';
export declare class Observable {
    static setBeforeAccessPropertyCallback(callback: PropertyAccessCallback): void;
    static observe(target: any, property: string, value: any): void;
    static makeObservable<T>(data: any): Observer;
    static toObservable(object: any): any;
    static notifyChanged<T>(data: object): void;
}
export declare type PropertyAccessCallback = (observer: Observer, property: string, value: any, data) => any;
