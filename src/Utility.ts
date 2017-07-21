
var uidCounter: number = 0;
var uniqueSymbol = `canvas2d.uid.${Date.now()}`;
// var reFileName = /(\w+)\.\w+$/;
var reFilePath = /(.+)\.\w+$/;

export class Utility {

    private static UID_OF_NAN: number;
    private static UID_OF_NULL: number;
    private static UID_OF_TRUE: number;
    private static UID_OF_FALSE: number;
    private static UID_OF_UNDEFINED: number;
    private static isUidInited: boolean;

    public static log(...args: any[]) {
        console.log("[canvas2dUI]", ...args);
    }

    public static error(...args: any[]): any {
        console.error("[canvas2dUI]", ...args);
    }

    public static warn(...args: any[]): any {
        console.warn("[canvas2dUI]", ...args);
    }

    public static getUid(target): number {
        if (!this.isUidInited) {
            this.UID_OF_FALSE = this.getObjectUid({});
            this.UID_OF_NAN = this.getObjectUid({});
            this.UID_OF_NULL = this.getObjectUid({});
            this.UID_OF_TRUE = this.getObjectUid({});
            this.UID_OF_UNDEFINED = this.getObjectUid({});
        }
        if (target === null) {
            return this.UID_OF_NULL;
        }
        if (target === undefined) {
            return this.UID_OF_UNDEFINED;
        }
        if (target === true) {
            return this.UID_OF_TRUE;
        }
        if (target === false) {
            return this.UID_OF_FALSE;
        }

        let type = typeof target;

        if (type === 'object' || type === 'function') {
            return this.getObjectUid(target);
        }
        if (type === 'string') {
            return <any>('"' + target + '"');
        }
        if (type === 'number') {
            if (isNaN(target)) {
                return this.UID_OF_NAN;
            }
            return <any>('-' + target + '-');
        }
        this.error(`Unknow type of target`, target);
    }

    private static getObjectUid(target) {
        if (typeof target[uniqueSymbol] === 'undefined') {
            Object.defineProperty(target, uniqueSymbol, {
                value: uidCounter++
            });
        }
        return target[uniqueSymbol];
    }

    public static isNewValueAnObjectOrNotEqualOldValue(a, b) {
        return a !== b || (typeof a === 'object' && a);
    }

    public static isPlainObjectOrObservableObject(target: any): boolean {
        if (!target || typeof target !== 'object') {
            return false;
        }

        let prototype = Object.getPrototypeOf(target);
        let isObjectType = Object.prototype.toString.call(target) === '[object Object]';
        let isRawObject = prototype === Object.prototype;

        return isObjectType && isRawObject;
    }

    public static removeItemFromArray(item, arr: any[]) {
        let index = arr.indexOf(item);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }

    public static addEnsureUniqueArrayItem(item, arr: any[]) {
        let index = arr.indexOf(item);
        if (index < 0) {
            arr.push(item);
        }
    }

    public static createProxy(target: object, property: string, source: object) {
        if (this.hasProxy(target, property)) {
            return false;
        }

        function proxyGetterSetter(...args: any[]) {
            if (args.length === 0) {
                return source[property];
            }
            source[property] = args[0];
        }

        Object.defineProperty(target, property, {
            enumerable: true,
            configurable: true,
            set: proxyGetterSetter,
            get: proxyGetterSetter
        });

        return true;
    }

    public static hasProxy(target: any, property: string) {
        var des = Object.getOwnPropertyDescriptor(target, property);
        if (des && ((typeof des.get === 'function' && des.get === des.set) || !des.configurable)) {
            return true;
        }

        var proto = target.__proto__;
        while (proto) {
            des = Object.getOwnPropertyDescriptor(proto, property);
            if (des && ((typeof des.get === 'function' && des.get === des.set) || !des.configurable)) {
                Object.defineProperty(target, property, des);
                return true;
            }
            proto = proto.__proto__;
        }

        return false;
    }

    public static deepClone(target) {
        if (target && typeof target === 'object') {
            if (Array.isArray(target)) {
                return target.map((item) => {
                    return this.deepClone(item);
                });
            }
            var ret = {};
            Object.keys(target).forEach(name => {
                ret[name] = this.deepClone(target[name]);
            });
            return ret;
        }

        return target;
    }

    public static queryStringToObject(str: string) {
        let ret: { [key: string]: any } = {};

        str.split('&').forEach((pair) => {
            let [key, value] = pair.split('=');
            value = decodeURIComponent(value);

            if (ret[key] != null) {
                if (!Array.isArray(ret[key])) {
                    ret[key] = [ret[key]];
                }
                ret[key].push(value);
            }
            else {
                ret[key] = value;
            }
        });

        return ret;
    }

    public static objToQueryString(obj: Object) {
        return Object.keys(obj).map(key => {
            let value = obj[key];
            if (Array.isArray(value)) {
                return value.map(v => key + '=' + encodeURIComponent(v));
            }
            return key + '=' + encodeURIComponent(value)
        }).join('&');
    }

    public static getFilePath(path: string) {
        let res = path.match(reFilePath);
        return res && res[1];
    }

    private static nextTickCallbacks: { callback: Function, thisObject: any }[] = [];
    private static nextTickHandle: number;

    public static nextTick(callback: Function, thisObject?) {
        if (this.nextTickCallbacks.some(c => c.callback === callback && c.thisObject === thisObject)) {
            return;
        }
        this.nextTickCallbacks.push({
            callback,
            thisObject,
        });
        if (this.nextTickHandle == null) {
            this.nextTickHandle = (window.requestAnimationFrame || setTimeout)(() => {
                this.nextTickHandle = null;
                let callbacks = this.nextTickCallbacks.slice();
                this.nextTickCallbacks.length = 0;
                callbacks.forEach(context => {
                    context.callback.call(context.thisObject);
                });
            });
        }
    }
}