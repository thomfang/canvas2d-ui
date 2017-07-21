import { Observable } from './Observable';

export class ObservableObject {

    public static setProperty(object: object, property: string, value) {
        var descriptor = Object.getOwnPropertyDescriptor(object, property);

        if (!descriptor || (!descriptor.get && !descriptor.set)) {
            var oldValue: any = object[property];

            Observable.observe(object, property, value);

            if (oldValue !== value) {
                Observable.notifyChanged(object);
            }
        }
        else {
            object[property] = value;
        }
    }

    public static removeProperty(object: object, property: string) {
        if (!object.hasOwnProperty(property)) {
            return;
        }

        delete object[property];
        Observable.notifyChanged(object);
    }
}