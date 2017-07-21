import { Observable } from './Observable';
import { Utility } from './Utility';

export class ObservableArray {

    public static extendedPrototype = Object.create(Array.prototype, {

        pop: {
            value: function pop() {
                let result = Array.prototype.pop.call(this);
                Observable.notifyChanged(this);
                return result;
            }
        },

        shift: {
            value: function shift() {
                let result = Array.prototype.shift.call(this);
                Observable.notifyChanged(this);
                return result;
            }
        },

        push: {
            value: function push(...args: any[]) {
                let result = Array.prototype.push.apply(this, args);
                args.forEach(Observable.makeObservable);
                Observable.notifyChanged(this);
                return result;
            }
        },

        unshift: {
            value: function unshift(...args: any[]) {
                let result = Array.prototype.unshift.apply(this, args);
                args.forEach(Observable.makeObservable);
                Observable.notifyChanged(this);
                return result;
            }
        },

        splice: {
            value: function splice(...args: any[]) {
                let result = Array.prototype.splice.apply(this, args);
                args.slice(2).forEach(Observable.makeObservable);
                Observable.notifyChanged(this);
                return result;
            }
        },

        sort: {
            value: function sort(callback?: (a: any, b: any) => any[]) {
                let result = Array.prototype.sort.call(this, callback);
                Observable.notifyChanged(this);
                return result;
            }
        },

        reverse: {
            value: function reverse() {
                let result = Array.prototype.reverse.call(this);
                Observable.notifyChanged(this);
                return result;
            }
        }
    });

    public static setAt<T>(array: Array<T>, index: number, value: T): void {
        if (index > array.length) {
            array.length = index + 1;
        }

        array.splice(index, 1, value);
    }

    public static removeAt<T>(array: Array<T>, index: number): T {
        let result: T;

        if (index > -1 && index < array.length) {
            result = Array.prototype.splice.call(array, index, 1)[0];

            Observable.notifyChanged(array);
        }

        return result;
    }

    public static removeByItem<T>(array: Array<T>, value: any): void {
        Utility.removeItemFromArray(value, array);
    }

    public static removeAllByItem<T>(array: Array<T>, value: any): void {
        var matchedIndexList: number[] = [];
        var step = 0;

        array.forEach((item, index) => {
            if (value === item) {
                matchedIndexList.push(index - step++);
            }
        });

        if (matchedIndexList.length) {
            matchedIndexList.forEach(index => {
                array.splice(index, 1);
            });
            Observable.notifyChanged(array);
        }
    }
}