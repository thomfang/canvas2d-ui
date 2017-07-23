export declare class Watcher {
    component: any;
    exp: string;
    isDeepWatch: boolean;
    static getKey(exp: string, isDeepWatch?: boolean): string;
    private callbacks;
    private hasInterpolation;
    private observers;
    private properties;
    private tmpObservers;
    private tmpProperties;
    private valueGetter;
    isActived: boolean;
    value: any;
    constructor(component: any, exp: string, isDeepWatch?: boolean);
    addCallback(callback: WatcherCallback): void;
    removeCallback(callback: WatcherCallback): void;
    destroy(): void;
    private propertyChanged();
    private flush();
    private getValue();
    private beforeCallValueGetter();
    private afterCallValueGetter();
    private subscribePropertyChanged(observer, property);
}
export declare type WatcherCallback = (newValue, oldValue) => any;
