import { VirtualView } from './ViewManager';
import { EventEmitter, Sprite } from 'canvas2djs';
export declare class ComponentManager {
    private static componentModelSources;
    private static registeredComponentProperties;
    private static registeredComponentCtors;
    static registeredBaseComponentCtors: {
        [name: string]: IBaseComponentCtor;
    };
    static registerComponent(name: string, ctor: Function, extendComponentName?: string): void;
    static registerBaseComponent(name: string, ctor: IBaseComponentCtor, extendComponentName?: string): void;
    static registerComponentProperty(component: IComponent, property: string, type: Function | Function[]): void;
    static registerComponentProperties(componentCtor: Function, properties: {
        [property: string]: Function | Function[];
    }): void;
    static createComponentByName(name: string): any;
    static createComponentByConstructor(ctor: Function): any;
    static mountComponent(component: IComponent, view: VirtualView): void;
    static getBaseComponentCtorByName(name: string): IBaseComponentCtor;
    static getRegisteredBaseComponentPropertiesByName(name: string): {
        [property: string]: Function | Function[];
    };
    static getRegisteredComponentPropertiesByName(name: string): {
        [property: string]: Function | Function[];
    };
    static getRegisteredComponentProperties(component: IComponent): {
        [property: string]: Function | Function[];
    };
    static destroyComponent(component: IComponent): void;
    private static createComponentModelSource(component);
}
export declare function Component(name: string, extendComponentName?: string): (componentCtor: Function) => void;
export declare function Property(type?: Function): (component: any, property: string) => void;
export declare function BaseComponent(name: string, extendComponentName?: string): (componentCtor: IBaseComponentCtor) => void;
export interface IComponent {
    emitter?: EventEmitter;
    onInit?(): any;
    onBeforeMount?(views: VirtualView): any;
    onAfterMounted?(): any;
    onDestroy?(): any;
}
export interface IBaseComponentCtor {
    new (): Sprite<{}>;
}
