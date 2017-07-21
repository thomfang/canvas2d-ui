import { Utility } from './Utility';
import { Observable } from './Observable';
import { ObservableObject } from './ObservableObject';
import { VirtualView } from './ViewManager';
import { BindingManager } from './BindingManager';
import { WatcherManager } from './WatcherManager';
import { EventEmitter } from 'canvas2djs';

export class ComponentManager {

    private static componentModelSources: { [uid: string]: object } = {};
    private static registeredComponentProperties: { [uid: string]: { [property: string]: Function | Function[] } } = {};
    private static registeredComponentCtors: { [name: string]: Function } = {};

    public static registerComponent(name: string, ctor: Function) {
        if (this.registeredComponentCtors[name] != null) {
            Utility.warn(`Component "${name} is override,"`, ctor);
        }
        this.registeredComponentCtors[name] = ctor;
    }

    public static registerComponentProperty(component: IComponent, property: string, type: Function | Function[]) {
        let uid = Utility.getUid(component.constructor);
        if (!this.registeredComponentProperties[uid]) {
            this.registeredComponentProperties[uid] = {};
        }
        this.registeredComponentProperties[uid][property] = type;
    }

    public static registerComponentProperties(componentCtor: Function, properties: { [property: string]: Function | Function[] }) {
        let uid = Utility.getUid(componentCtor);
        if (!this.registeredComponentProperties[uid]) {
            this.registeredComponentProperties[uid] = {};
        }
        this.registeredComponentProperties[uid] = {
            ...this.registeredComponentProperties[uid],
            ...properties
        };
    }

    public static createComponentByName(name: string) {
        let ctor: any = this.registeredComponentCtors[name];
        if (!ctor) {
            Utility.error(`Component "${name}" not found.`);
        }

        let instance = new ctor();
        let modelSource = this.createComponentModelSource(instance);
        let registeredProperties = this.getRegisteredComponentPropertiesByName(name);
        if (registeredProperties) {
            Object.keys(registeredProperties).forEach(property => {
                let value = instance[property];
                Utility.createProxy(instance, property, modelSource);
                ObservableObject.setProperty(modelSource, property, value);
            });
        }
        if (typeof instance.onInit === "function") {
            instance.onInit();
        }

        return instance;
    }

    public static createComponentByConstructor(ctor: Function) {
        let instance = new (ctor as any)();
        let modelSource = this.createComponentModelSource(instance);
        let registeredProperties = this.getRegisteredComponentProperties(instance);
        if (registeredProperties) {
            Object.keys(registeredProperties).forEach(property => {
                let value = instance[property];
                Utility.createProxy(instance, property, modelSource);
                ObservableObject.setProperty(modelSource, property, value);
            });
        }
        if (typeof instance.onInit === "function") {
            instance.onInit();
        }

        return instance;
    }

    public static mountComponent(component: IComponent, view: VirtualView) {
        if (typeof component.onBeforeMount === 'function') {
            component.onBeforeMount(view);
        }
        BindingManager.createBinding(component, view);
        if (typeof component.onAfterMounted === 'function') {
            component.onAfterMounted();
        }
    }

    public static getRegisteredComponentPropertiesByName(name: string) {
        let ctor = this.registeredComponentCtors[name];
        return ctor && this.registeredComponentProperties[Utility.getUid(ctor)];
    }

    public static getRegisteredComponentProperties(component: IComponent) {
        let ctor = component.constructor;
        return ctor && this.registeredComponentProperties[Utility.getUid(ctor)];
    }

    public static destroyComponent(component: IComponent) {
        if (typeof component.onDestroy === 'function') {
            component.onDestroy();
        }
        BindingManager.removeBinding(component);
        WatcherManager.removeWatchers(component);

        let uid = Utility.getUid(component);
        let properties = this.getRegisteredComponentProperties(component);
        if (properties) {
            Object.keys(properties).forEach(property => {
                delete component[property];
            });
        }
        delete this.componentModelSources[uid];
    }

    private static createComponentModelSource(component: IComponent) {
        let modelSource = Observable.toObservable({});
        let uid = Utility.getUid(component);
        this.componentModelSources[uid] = modelSource;
        return modelSource;
    }
}

export function Component(name: string) {
    return (componentCtor: Function) => {
        ComponentManager.registerComponent(name, componentCtor);
    };
}

export function Property(type: Function = String) {
    return (component, property: string) => {
        ComponentManager.registerComponentProperty(component, property, type);
    };
}

export interface IComponent {
    emitter?: EventEmitter;
    onInit?();
    onBeforeMount?(views: VirtualView);
    onAfterMounted?();
    onDestroy?();
}

/**
 * @Component("Button")
 * class Button {
 *     @Property(String)
 *     label: string;
 * }
 */