import { Observer } from './Observer';
import { Utility } from './Utility';
import { ObservableArray } from './ObservableArray';

var beforeAccessPropertyCallback: PropertyAccessCallback;

export class Observable {

    public static setBeforeAccessPropertyCallback(callback: PropertyAccessCallback) {
        beforeAccessPropertyCallback = callback;
    }

    public static observe(target, property: string, value: any): void {
        if (typeof value === 'function') {
            return;
        }

        let descriptor = Object.getOwnPropertyDescriptor(target, property);

        if (descriptor && typeof descriptor.get === 'function' && descriptor.get === descriptor.set) {
            return;
        }

        let targetObserver: Observer = Observable.makeObservable(target);
        let valueObserver: Observer = Observable.makeObservable(value);

        Object.defineProperty(target, property, {
            enumerable: true,
            configurable: true,
            get: propertyGetterSetter,
            set: propertyGetterSetter
        });

        if (valueObserver) {
            valueObserver.addPropertyChangedListener(propertyChanged);
        }

        function propertyGetterSetter(...args: any[]) {
            if (args.length === 0) {
                if (typeof beforeAccessPropertyCallback === 'function') {
                    beforeAccessPropertyCallback(targetObserver, property, value, target);
                }

                return value;
            }

            let newValue = args[0];

            if (!Utility.isNewValueAnObjectOrNotEqualOldValue(newValue, value)) {
                return;
            }

            if (valueObserver) {
                valueObserver.removePropertyChangedListener(propertyChanged);
            }

            value = newValue;
            valueObserver = Observable.makeObservable(newValue);

            if (valueObserver) {
                valueObserver.addPropertyChangedListener(propertyChanged);
            }

            propertyChanged();
        }

        function propertyChanged() {
            targetObserver.emit(property);
        }
    }

    public static makeObservable<T>(data): Observer {
        let isObject = Utility.isPlainObjectOrObservableObject(data);

        if (!isObject && !Array.isArray(data)) {
            return;
        }

        let observer: Observer;

        if (typeof data.__source__ !== 'undefined') {
            return data.__source__.__observer__;
        }

        if (typeof data.__observer__ === 'undefined') {
            observer = new Observer();

            Object.defineProperties(data, {
                __observer__: {
                    value: observer,
                    writable: true,
                    configurable: true
                }
            });

            if (isObject) {
                Object.keys(data).forEach((property: string) => {
                    Observable.observe(data, property, data[property]);
                });
            }
            else {
                data.__proto__ = ObservableArray.extendedPrototype;

                data.forEach((item) => {
                    Observable.makeObservable(item);
                });
            }
        }
        else {
            observer = data.__observer__;
        }

        return observer;
    }

    public static toObservable(object) {
        this.makeObservable(object);
        return object;
    }

    public static notifyChanged<T>(data: object): void {
        let observer: Observer = data['__observer__'];

        if (observer) {
            observer.emitPropertyChanged();
        }
    }
}

export type PropertyAccessCallback = (observer: Observer, property: string, value: any, data) => any;