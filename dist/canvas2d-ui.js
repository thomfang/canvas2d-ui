/**
 * canvas2d-ui v1.0.4
 * Copyright (c) 2017-present Todd Fon <tilfon9017@gmail.com>
 * All rights reserved.
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('canvas2djs')) :
    typeof define === 'function' && define.amd ? define('canvas2d-ui', ['exports', 'canvas2djs'], factory) :
    (factory((global.canvas2dUI = global.canvas2dUI || {}),global.canvas2d));
}(this, (function (exports,canvas2djs) { 'use strict';

var uidCounter = 0;
var uniqueSymbol = "canvas2d.uid." + Date.now();
// var reFileName = /(\w+)\.\w+$/;
var reFilePath = /(.+)\.\w+$/;
var Utility = (function () {
    function Utility() {
    }
    Utility.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, ["[canvas2dUI]"].concat(args));
    };
    Utility.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.error.apply(console, ["[canvas2dUI]"].concat(args));
    };
    Utility.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.warn.apply(console, ["[canvas2dUI]"].concat(args));
    };
    Utility.getUid = function (target) {
        if (!this.isUidInited) {
            this.UID_OF_FALSE = this.getObjectUid({});
            this.UID_OF_NAN = this.getObjectUid({});
            this.UID_OF_NULL = this.getObjectUid({});
            this.UID_OF_TRUE = this.getObjectUid({});
            this.UID_OF_UNDEFINED = this.getObjectUid({});
            this.isUidInited = true;
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
        var type = typeof target;
        if (type === 'object' || type === 'function') {
            return this.getObjectUid(target);
        }
        if (type === 'string') {
            return ('"' + target + '"');
        }
        if (type === 'number') {
            if (isNaN(target)) {
                return this.UID_OF_NAN;
            }
            return ('-' + target + '-');
        }
        this.error("Unknow type of target", target);
    };
    Utility.getObjectUid = function (target) {
        if (typeof target[uniqueSymbol] === 'undefined') {
            Object.defineProperty(target, uniqueSymbol, {
                value: uidCounter++
            });
        }
        return target[uniqueSymbol];
    };
    Utility.isNewValueAnObjectOrNotEqualOldValue = function (a, b) {
        return a !== b || (typeof a === 'object' && a);
    };
    Utility.isPlainObjectOrObservableObject = function (target) {
        if (!target || typeof target !== 'object') {
            return false;
        }
        var prototype = Object.getPrototypeOf(target);
        var isObjectType = Object.prototype.toString.call(target) === '[object Object]';
        var isRawObject = prototype === Object.prototype;
        return isObjectType && isRawObject;
    };
    Utility.removeItemFromArray = function (item, arr) {
        var index = arr.indexOf(item);
        if (index > -1) {
            arr.splice(index, 1);
            return true;
        }
        return false;
    };
    Utility.addEnsureUniqueArrayItem = function (item, arr) {
        var index = arr.indexOf(item);
        if (index < 0) {
            arr.push(item);
            return true;
        }
        return false;
    };
    Utility.createProxy = function (target, property, source) {
        if (this.hasProxy(target, property)) {
            return false;
        }
        function proxyGetterSetter() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
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
    };
    Utility.hasProxy = function (target, property) {
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
    };
    Utility.deepClone = function (target) {
        var _this = this;
        if (target && typeof target === 'object') {
            if (Array.isArray(target)) {
                return target.map(function (item) {
                    return _this.deepClone(item);
                });
            }
            var ret = {};
            Object.keys(target).forEach(function (name) {
                ret[name] = _this.deepClone(target[name]);
            });
            return ret;
        }
        return target;
    };
    Utility.queryStringToObject = function (str) {
        var ret = {};
        str.split('&').forEach(function (pair) {
            var _a = pair.split('='), key = _a[0], value = _a[1];
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
    };
    Utility.objToQueryString = function (obj) {
        return Object.keys(obj).map(function (key) {
            var value = obj[key];
            if (Array.isArray(value)) {
                return value.map(function (v) { return key + '=' + encodeURIComponent(v); });
            }
            return key + '=' + encodeURIComponent(value);
        }).join('&');
    };
    Utility.getFilePath = function (path) {
        var res = path.match(reFilePath);
        return res && res[1];
    };
    Utility.nextTick = function (callback, thisObject) {
        var _this = this;
        if (this.nextTickCallbacks.some(function (c) { return c.callback === callback && c.thisObject === thisObject; })) {
            return;
        }
        this.nextTickCallbacks.push({
            callback: callback,
            thisObject: thisObject,
        });
        if (this.nextTickHandle == null) {
            this.nextTickHandle = (window.requestAnimationFrame || setTimeout)(function () {
                _this.nextTickHandle = null;
                var callbacks = _this.nextTickCallbacks.slice();
                _this.nextTickCallbacks.length = 0;
                callbacks.forEach(function (context) {
                    context.callback.call(context.thisObject);
                });
            });
        }
    };
    Utility.nextTickCallbacks = [];
    return Utility;
}());

var schemeRegex = /^(\w+)\:\/\//;
var Request = (function () {
    function Request() {
    }
    Request.xhr = function (options, onSuccess, onError, onComplete) {
        var xhr = new XMLHttpRequest();
        if (typeof options.url !== 'string' || !options.url) {
            return Utility.error("xhr(options): Invalid options.url.");
        }
        var url = options.url;
        var type = (options.method || 'GET').toUpperCase();
        var headers = options.headers || {};
        var data = options.data;
        var contentType = options.contentType;
        var isLocalRequest = false;
        var schemeMatch = schemeRegex.exec(options.url.toLowerCase());
        if (schemeMatch) {
            if (schemeMatch[1] === 'file') {
                isLocalRequest = true;
            }
        }
        else if (location.protocol === 'file:') {
            isLocalRequest = true;
        }
        if (Object.prototype.toString.call(data) === '[object Object]') {
            if (contentType && contentType.match(/json/i)) {
                data = JSON.stringify(data);
            }
            else {
                data = Utility.objToQueryString(data);
                if (type === 'GET') {
                    url += (url.indexOf('?') === -1 ? '?' : '&') + data;
                    data = null;
                }
            }
        }
        xhr.onload = function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || (isLocalRequest && xhr.status === 0)) {
                    onSuccess && onSuccess(xhr.response);
                }
                else {
                    var contentType_1 = xhr.getResponseHeader('Content-Type');
                    onError && onError({
                        res: xhr.response,
                        xhr: xhr
                    });
                }
                xhr = null;
                onComplete && onComplete();
            }
        };
        xhr.open(type, url, true, options.user, options.password);
        if (options.withCredentials) {
            xhr.withCredentials = true;
        }
        if (options.responseType) {
            xhr.responseType = options.responseType;
        }
        if (typeof options.timeout === 'number' && options.timeout > 0) {
            xhr.timeout = options.timeout;
            xhr.ontimeout = function () {
                if (xhr) {
                    xhr.abort();
                    onError && onError({ res: { message: "Timeout" }, xhr: xhr });
                    xhr = null;
                    onComplete && onComplete();
                }
            };
        }
        if (contentType) {
            xhr.setRequestHeader("Content-Type", contentType);
        }
        Object.keys(headers).forEach(function (name) {
            xhr.setRequestHeader(name, headers[name]);
        });
        xhr.send(data);
    };
    Request.get = function (url, onSuccess, onError, onComplete) {
        this.xhr({ url: url }, onSuccess, onError, onComplete);
    };
    Request.post = function (url, data, onSuccess, onError, onComplete) {
        this.xhr({ url: url, method: "POST", data: data, contentType: "application/json", }, onSuccess, onError, onComplete);
    };
    Request.getJson = function (url, onSuccess, onError, onComplete) {
        this.xhr({ url: url, responseType: 'json' }, onSuccess, onError, onComplete);
    };
    Request.postJson = function (url, data, onSuccess, onError, onComplete) {
        this.xhr({ url: url, method: "POST", data: data, responseType: 'json', contentType: "application/json" }, onSuccess, onError, onComplete);
    };
    return Request;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};



function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}













function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}



function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

var Observer = (function (_super) {
    __extends(Observer, _super);
    function Observer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.propertyChangedListeners = [];
        return _this;
    }
    Observer.prototype.addPropertyChangedListener = function (listener) {
        if (this.propertyChangedListeners.indexOf(listener) < 0) {
            this.propertyChangedListeners.push(listener);
        }
    };
    Observer.prototype.removePropertyChangedListener = function (listener) {
        var index = this.propertyChangedListeners.indexOf(listener);
        if (index > -1) {
            this.propertyChangedListeners.splice(index, 1);
        }
    };
    Observer.prototype.emitPropertyChanged = function () {
        this.propertyChangedListeners.slice().forEach(function (listener) { return listener(); });
    };
    return Observer;
}(canvas2djs.EventEmitter));

var ObservableArray = (function () {
    function ObservableArray() {
    }
    ObservableArray.setAt = function (array, index, value) {
        if (index > array.length) {
            array.length = index + 1;
        }
        array.splice(index, 1, value);
    };
    ObservableArray.removeAt = function (array, index) {
        var result;
        if (index > -1 && index < array.length) {
            result = Array.prototype.splice.call(array, index, 1)[0];
            Observable.notifyChanged(array);
        }
        return result;
    };
    ObservableArray.removeByItem = function (array, value) {
        Utility.removeItemFromArray(value, array);
    };
    ObservableArray.removeAllByItem = function (array, value) {
        var matchedIndexList = [];
        var step = 0;
        array.forEach(function (item, index) {
            if (value === item) {
                matchedIndexList.push(index - step++);
            }
        });
        if (matchedIndexList.length) {
            matchedIndexList.forEach(function (index) {
                array.splice(index, 1);
            });
            Observable.notifyChanged(array);
        }
    };
    ObservableArray.extendedPrototype = Object.create(Array.prototype, {
        pop: {
            value: function pop() {
                var result = Array.prototype.pop.call(this);
                Observable.notifyChanged(this);
                return result;
            }
        },
        shift: {
            value: function shift() {
                var result = Array.prototype.shift.call(this);
                Observable.notifyChanged(this);
                return result;
            }
        },
        push: {
            value: function push() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var result = Array.prototype.push.apply(this, args);
                args.forEach(Observable.makeObservable);
                Observable.notifyChanged(this);
                return result;
            }
        },
        unshift: {
            value: function unshift() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var result = Array.prototype.unshift.apply(this, args);
                args.forEach(Observable.makeObservable);
                Observable.notifyChanged(this);
                return result;
            }
        },
        splice: {
            value: function splice() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var result = Array.prototype.splice.apply(this, args);
                args.slice(2).forEach(Observable.makeObservable);
                Observable.notifyChanged(this);
                return result;
            }
        },
        sort: {
            value: function sort(callback) {
                var result = Array.prototype.sort.call(this, callback);
                Observable.notifyChanged(this);
                return result;
            }
        },
        reverse: {
            value: function reverse() {
                var result = Array.prototype.reverse.call(this);
                Observable.notifyChanged(this);
                return result;
            }
        }
    });
    return ObservableArray;
}());

var beforeAccessPropertyCallback;
var Observable = (function () {
    function Observable() {
    }
    Observable.setBeforeAccessPropertyCallback = function (callback) {
        beforeAccessPropertyCallback = callback;
    };
    Observable.observe = function (target, property, value) {
        if (typeof value === 'function') {
            return;
        }
        var descriptor = Object.getOwnPropertyDescriptor(target, property);
        if (descriptor && typeof descriptor.get === 'function' && descriptor.get === descriptor.set) {
            return;
        }
        var targetObserver = Observable.makeObservable(target);
        var valueObserver = Observable.makeObservable(value);
        Object.defineProperty(target, property, {
            enumerable: true,
            configurable: true,
            get: propertyGetterSetter,
            set: propertyGetterSetter
        });
        if (valueObserver) {
            valueObserver.addPropertyChangedListener(propertyChanged);
        }
        function propertyGetterSetter() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 0) {
                if (typeof beforeAccessPropertyCallback === 'function') {
                    beforeAccessPropertyCallback(targetObserver, property, value, target);
                }
                return value;
            }
            var newValue = args[0];
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
    };
    Observable.makeObservable = function (data) {
        var isObject = Utility.isPlainObjectOrObservableObject(data);
        if (!isObject && !Array.isArray(data)) {
            return;
        }
        var observer;
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
                Object.keys(data).forEach(function (property) {
                    Observable.observe(data, property, data[property]);
                });
            }
            else {
                data.__proto__ = ObservableArray.extendedPrototype;
                data.forEach(function (item) {
                    Observable.makeObservable(item);
                });
            }
        }
        else {
            observer = data.__observer__;
        }
        return observer;
    };
    Observable.toObservable = function (object) {
        this.makeObservable(object);
        return object;
    };
    Observable.notifyChanged = function (data) {
        var observer = data['__observer__'];
        if (observer) {
            observer.emitPropertyChanged();
        }
    };
    return Observable;
}());

var ObservableObject = (function () {
    function ObservableObject() {
    }
    ObservableObject.setProperty = function (object, property, value) {
        var descriptor = Object.getOwnPropertyDescriptor(object, property);
        if (!descriptor || (!descriptor.get && !descriptor.set)) {
            var oldValue = object[property];
            Observable.observe(object, property, value);
            if (oldValue !== value) {
                Observable.notifyChanged(object);
            }
        }
        else {
            object[property] = value;
        }
    };
    ObservableObject.removeProperty = function (object, property) {
        if (!object.hasOwnProperty(property)) {
            return;
        }
        delete object[property];
        Observable.notifyChanged(object);
    };
    return ObservableObject;
}());

var nameOfEvent = "$event";
var nameOfGlobal = "$global";
var nameOfElement = "$element";
var reInterpolation = /\{\{((.|\n)+?)\}\}/g;
var Parser = (function () {
    function Parser() {
    }
    Parser.parseToGetter = function (exp) {
        if (!/\S+/.test(exp)) {
            return Utility.error("Invalid expression \"" + exp + "\" for parsing to a getter.");
        }
        try {
            return new Function("try{with(this) {return " + exp + "}}catch(e){ }");
        }
        catch (e) {
            Utility.error("Error parsing expression \"" + exp + "\" to a getter,", e);
        }
    };
    Parser.parseToSetter = function (exp) {
        if (!/\S+/.test(exp)) {
            return Utility.error("Invalid expression \"" + exp + "\" for parsing to a setter.");
        }
        try {
            return new Function("__setterValue__", "try{with(this) {return " + exp + " = __setterValue__}}catch(e){ }");
        }
        catch (e) {
            Utility.error("Error parsing expression \"" + exp + "\" to a setter,", e);
        }
    };
    Parser.hasInterpolation = function (str) {
        return typeof str === 'string' && str.match(reInterpolation) !== null;
    };
    Parser.parseInterpolationToGetter = function (expression) {
        if (!this.hasInterpolation(expression)) {
            return Utility.error("Expression \"" + expression + " has no interpolation value.\"");
        }
        var tokens = [];
        var index = 0;
        var str = expression.trim();
        var length = str.length;
        str.replace(reInterpolation, function ($0, exp, $2, i) {
            if (i > index) {
                tokens.push("\"" + str.slice(index, i) + "\"");
            }
            tokens.push('(' + exp.trim() + ')');
            index = i + $0.length;
            return $0;
        });
        if (index < length && index !== 0) {
            tokens.push("\"" + str.slice(index) + "\"");
        }
        try {
            return new Function("try{with(this) {return " + tokens.join('+') + "}}catch(e){ }");
        }
        catch (e) {
            Utility.error("Error parsing expression \"" + expression + "\" to an interpolation getter, ", e);
        }
    };
    Parser.parseToFunction = function (exp) {
        if (!/\S+/.test(exp)) {
            return Utility.error("Invalid expression \"" + exp + "\" for parsing to a handler.");
        }
        try {
            return new Function(nameOfGlobal, nameOfEvent, nameOfElement, "try{ with (this) { " + exp + " } } catch (e) {  } ");
        }
        catch (e) {
            Utility.error("Error parsing expression \"" + exp + "\" to a handler, ", e);
        }
    };
    return Parser;
}());

// Regular Expressions for parsing tags and attributes
var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:@][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
var endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/;
var attr = /([a-zA-Z_:@][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
// Empty Elements - HTML 5
var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr");
// Block Elements - HTML 5
var block = makeMap("a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");
// Inline Elements - HTML 5
var inline = makeMap("abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");
// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");
// Attributes that have their values filled in disabled="disabled"
var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");
// Special Elements (can contain anything)
var special = makeMap("script,style");
function processHtml(html, handler) {
    var index, chars, match, stack = [], last = html;
    var getStackLast = function () {
        return stack[stack.length - 1];
    };
    while (html) {
        chars = true;
        // Make sure we're not in a script or style element
        if (!getStackLast() || !special[getStackLast()]) {
            // Comment
            if (html.indexOf("<!--") == 0) {
                index = html.indexOf("-->");
                if (index >= 0) {
                    if (handler.comment)
                        handler.comment(html.substring(4, index));
                    html = html.substring(index + 3);
                    chars = false;
                }
                // end tag
            }
            else if (html.indexOf("</") == 0) {
                match = html.match(endTag);
                if (match) {
                    html = html.substring(match[0].length);
                    match[0].replace(endTag, parseEndTag);
                    chars = false;
                }
                // start tag
            }
            else if (html.indexOf("<") == 0) {
                match = html.match(startTag);
                if (match) {
                    html = html.substring(match[0].length);
                    match[0].replace(startTag, parseStartTag);
                    chars = false;
                }
            }
            if (chars) {
                index = html.indexOf("<");
                var text = index < 0 ? html : html.substring(0, index);
                html = index < 0 ? "" : html.substring(index);
                if (handler.chars)
                    handler.chars(text);
            }
        }
        else {
            html = html.replace(new RegExp("([\\s\\S]*?)<\/" + getStackLast() + "[^>]*>"), function (all, text) {
                text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
                if (handler.chars)
                    handler.chars(text);
                return "";
            });
            parseEndTag("", getStackLast());
        }
        if (html == last)
            throw "Parse Error: " + html;
        last = html;
    }
    // Clean up any remaining tags
    parseEndTag(undefined, undefined);
    function parseStartTag(tag, tagName, rest, unary) {
        // tagName = tagName.toLowerCase();
        if (block[tagName]) {
            while (getStackLast() && inline[getStackLast()]) {
                parseEndTag("", getStackLast());
            }
        }
        if (closeSelf[tagName] && getStackLast() == tagName) {
            parseEndTag("", tagName);
        }
        unary = empty[tagName] || !!unary;
        if (!unary)
            stack.push(tagName);
        if (handler.start) {
            var attrs = [];
            rest.replace(attr, function (match, name) {
                var value = arguments[2] ? arguments[2] :
                    arguments[3] ? arguments[3] :
                        arguments[4] ? arguments[4] :
                            fillAttrs[name] ? name : "";
                attrs.push({
                    name: name,
                    value: value,
                    escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
                });
            });
            if (handler.start)
                handler.start(tagName, attrs, unary);
        }
    }
    function parseEndTag(tag, tagName) {
        // If no tag name is provided, clean shop
        if (!tagName)
            var pos = 0;
        else
            for (var pos = stack.length - 1; pos >= 0; pos--)
                if (stack[pos] == tagName)
                    break;
        if (pos >= 0) {
            // Close all the open elements, up the stack
            for (var i = stack.length - 1; i >= pos; i--)
                if (handler.end)
                    handler.end(stack[i]);
            // Remove the open elements from the stack
            stack.length = pos;
        }
    }
}
function parseTemplateToVirtualNode(html) {
    var bufArray = [];
    var results = {
        type: 'root',
        child: [],
    };
    processHtml(html, {
        start: function (tag, attrs, unary) {
            // node for this element
            var node = {
                type: 'element',
                tag: tag,
            };
            if (attrs.length !== 0) {
                node.attr = attrs.reduce(function (pre, attr) {
                    var name = attr.name;
                    var value = attr.value;
                    // has multi attibutes
                    // make it array of attribute
                    // if (value.match(/ /)) {
                    //     value = value.split(' ');
                    // }
                    // if attr already exists
                    // merge it
                    if (pre[name]) {
                        if (Array.isArray(pre[name])) {
                            // already array, push to last
                            pre[name].push(value);
                        }
                        else {
                            // single value, make it array
                            pre[name] = [pre[name], value];
                        }
                    }
                    else {
                        // not exist, put it
                        pre[name] = value;
                    }
                    return pre;
                }, {});
            }
            if (unary) {
                // if this tag dosen't have end tag
                // like <img src="hoge.png"/>
                // add to parents
                var parent = bufArray[0] || results;
                if (parent.child === undefined) {
                    parent.child = [];
                }
                parent.child.push(node);
            }
            else {
                bufArray.unshift(node);
            }
        },
        end: function (tag) {
            // merge into parent tag
            var node = bufArray.shift();
            if (node.tag !== tag)
                console.error('invalid state: mismatch end tag');
            if (bufArray.length === 0) {
                results.child.push(node);
            }
            else {
                var parent = bufArray[0];
                if (parent.child === undefined) {
                    parent.child = [];
                }
                parent.child.push(node);
            }
        },
        chars: function (text) {
            if (/\S/.test(text) && bufArray.length != 0) {
                var parent = bufArray[0];
                if (parent.tag === "text") {
                    var node = {
                        type: 'text',
                        text: text,
                    };
                    if (parent.child === undefined) {
                        parent.child = [];
                    }
                    parent.child.push(node);
                }
            }
        },
        comment: function (text) {
            // debug(text);
            // var node = {
            //   node: 'comment',
            //   text: text,
            // };
            // var parent = bufArray[0];
            // if (parent.child === undefined) {
            //   parent.child = [];
            // }
            // parent.child.push(node);
        },
    });
    if (results.child.length > 1) {
        Utility.error("Invalid template, one root node required!");
    }
    return results.child[0];
}
function makeMap(str) {
    var obj = {}, items = str.split(",");
    for (var i = 0; i < items.length; i++)
        obj[items[i]] = true;
    return obj;
}

var TemplateManager = (function () {
    function TemplateManager() {
    }
    TemplateManager.registerHtmlTemplate = function (name, template) {
        this.registeredParsedTemplateByName[name] = parseTemplateToVirtualNode(template);
    };
    TemplateManager.registerJsonTemplate = function (name, template) {
        this.registeredParsedTemplateByName[name] = template;
    };
    TemplateManager.getTemplateByName = function (name) {
        return this.registeredParsedTemplateByName[name];
    };
    TemplateManager.registeredParsedTemplateByName = {};
    return TemplateManager;
}());

var StyleManager = (function () {
    function StyleManager() {
    }
    StyleManager.registerStyle = function (name, styleProps) {
        if (this.registeredStyle[name] != null) {
            Utility.warn("Style \"" + name + "\" is overried");
        }
        this.registeredStyle[name] = styleProps;
    };
    StyleManager.registerStyleMap = function (namespace, styleMap) {
        var _this = this;
        Object.keys(styleMap).forEach(function (name) {
            _this.registerStyle(namespace + "-" + name, styleMap[name]);
        });
    };
    StyleManager.getStyleByName = function (name) {
        return this.registeredStyle[name];
    };
    StyleManager.getAllRegisterStyles = function () {
        return __assign({}, this.registeredStyle);
    };
    StyleManager.registeredStyle = {};
    return StyleManager;
}());

var reBindableAttr = /^[:@]/;
var ViewManager = (function () {
    function ViewManager() {
    }
    ViewManager.createView = function (node) {
        if (node.attr) {
            var terminalDirective = BindingManager.getHighestPriorityTerminal(node.attr);
            if (terminalDirective != null) {
                var sprite = new canvas2djs.Sprite();
                var attr = __assign({}, node.attr);
                delete attr[terminalDirective];
                return {
                    node: __assign({}, node, { attr: attr }),
                    sprite: sprite,
                    instance: sprite,
                    directives: (_a = {}, _a[terminalDirective] = node.attr[terminalDirective], _a),
                };
            }
        }
        var ctor = ComponentManager.getBaseComponentCtorByName(node.tag);
        if (ctor != null) {
            return this.createSprite(node, new ctor());
        }
        // if (node.tag === "sprite") {
        //     return this.createSprite(node, new Sprite());
        // }
        // if (node.tag === 'ScrollView') {
        //     return this.createSprite(node, new ScrollView());
        // }
        // if (node.tag === 'AutoLayoutView') {
        //     return this.createSprite(node, new AutoLayoutView());
        // }
        // if (node.tag === 'AutoResizeView') {
        //     return this.createSprite(node, new AutoResizeView());
        // }
        if (node.tag === "text" || node.tag === "bmfont") {
            return this.createTextLabel(node);
        }
        return this.createComponent(node);
        var _a;
    };
    ViewManager.createSprite = function (node, sprite) {
        var _this = this;
        var view = { instance: sprite, sprite: sprite, };
        if (node.attr) {
            var directives_1;
            Object.keys(node.attr).forEach(function (name) {
                var value = node.attr[name];
                if (BindingManager.isRegisteredDirective(name) || reBindableAttr.test(name) || Parser.hasInterpolation(value)) {
                    if (!directives_1) {
                        directives_1 = {};
                    }
                    directives_1[name] = value;
                }
                else {
                    _this.setAttribute(sprite, name, value);
                }
            });
            if (directives_1) {
                view.directives = directives_1;
            }
        }
        if (node.child) {
            var children = node.child.map(function (c) { return _this.createView(c); });
            children.forEach(function (child) {
                sprite.addChild(child.sprite);
            });
            view.child = children;
        }
        return view;
    };
    ViewManager.createTextLabel = function (node) {
        var _this = this;
        var textLabel = node.tag === 'text' ? new canvas2djs.TextLabel() : new canvas2djs.BMFontLabel();
        var view = { instance: textLabel, sprite: textLabel, };
        if (node.attr) {
            var directives_2;
            Object.keys(node.attr).forEach(function (name) {
                var value = node.attr[name];
                if (BindingManager.isRegisteredDirective(name) || reBindableAttr.test(name) || Parser.hasInterpolation(value)) {
                    if (!directives_2) {
                        directives_2 = {};
                    }
                    directives_2[name] = value;
                }
                else {
                    _this.setAttribute(textLabel, name, value);
                }
            });
            if (directives_2) {
                view.directives = directives_2;
            }
        }
        if (node.child) {
            var content = node.child.map(function (child) {
                if (child.type !== 'text') {
                    return Utility.error("<text> only supports text content.");
                }
                return child.text;
            }).join("");
            if (Parser.hasInterpolation(content)) {
                if (!view.directives) {
                    view.directives = {};
                }
                view.directives.text = content;
            }
            else {
                textLabel.text = content;
            }
        }
        return view;
    };
    ViewManager.createComponent = function (node) {
        var _this = this;
        var component = ComponentManager.createComponentByName(node.tag);
        var view = { instance: component, isComponent: true, };
        var sprite;
        if (node.attr) {
            var directives_3;
            Object.keys(node.attr).forEach(function (name) {
                var value = node.attr[name];
                if (BindingManager.isRegisteredDirective(name) || reBindableAttr.test(name) || Parser.hasInterpolation(value)) {
                    if (!directives_3) {
                        directives_3 = {};
                    }
                    directives_3[name] = value;
                }
                else if (name !== 'template') {
                    _this.setAttribute(component, name, value);
                }
            });
            if (directives_3) {
                view.directives = directives_3;
            }
            if (node.attr.template) {
                var template = TemplateManager.getTemplateByName(node.attr.template);
                if (template == null) {
                    Utility.error("Template \"" + node.attr.template + "\" not found.");
                }
                var templateView = this.createView(template);
                view.sprite = templateView.sprite;
                view.child = [templateView];
            }
            else {
                Utility.error("Template of component \"" + node.tag + "\" not given.");
            }
        }
        if (node.child) {
            view.nestChild = node.child.map(function (c) { return _this.createView(c); });
        }
        return view;
    };
    ViewManager.setAttribute = function (object, attrName, attrValue) {
        if (attrName === "styles") {
            if (typeof object.setProps === 'function') {
                var styleProps_1;
                if (typeof attrValue === 'string') {
                    attrValue = attrValue.split(/\s+/);
                }
                else if (Object.prototype.toString.call(attrValue) === '[object Object]') {
                    attrValue = Object.keys(attrValue).filter(function (name) { return !!attrValue[name]; });
                }
                if (Array.isArray(attrValue)) {
                    styleProps_1 = {};
                    attrValue.forEach(function (styleName) {
                        var style = StyleManager.getStyleByName(styleName);
                        if (!style) {
                            Utility.warn("Style \"" + styleName + "\" not found.");
                        }
                        else {
                            styleProps_1 = __assign({}, styleProps_1, style);
                        }
                    });
                }
                else {
                    return Utility.warn("Invalid style value:", attrValue);
                }
                object.setProps(styleProps_1);
            }
            else {
                object[attrName] = attrValue;
            }
            return;
        }
        if (attrName === 'actions') {
            if (typeof attrValue === 'string') {
                var style = StyleManager.getStyleByName(attrValue);
                if (style == null) {
                    return Utility.error("Action \"" + attrValue + "\" not found.");
                }
                if (style.startProps) {
                    object.setProps(style.startProps);
                }
                var action = new canvas2djs.Action(object, name).queue(style.queue);
                if (style.repeatMode != null) {
                    action.setRepeatMode(style.repeatMode);
                }
                action.start();
            }
            else if (Object.prototype.toString.call(attrValue) === '[object Object]') {
                Object.keys(attrValue).forEach(function (name) {
                    if (!attrValue[name]) {
                        return canvas2djs.Action.stop(object, name);
                    }
                    var style = StyleManager.getStyleByName(name);
                    if (style == null) {
                        return Utility.error("Action \"" + name + "\" not found.");
                    }
                    if (style.startProps) {
                        object.setProps(style.startProps);
                    }
                    var action = new canvas2djs.Action(object, name).queue(style.queue);
                    if (style.repeatMode != null) {
                        action.setRepeatMode(style.repeatMode);
                    }
                    action.start();
                });
            }
            else {
                Utility.error("Invalid action directive, value is not an object", attrValue);
            }
            return;
        }
        var registerProperties = ComponentManager.getRegisteredComponentProperties(object);
        if (!registerProperties || registerProperties[attrName] == null || attrValue == null) {
            return object[attrName] = attrValue;
        }
        var ctor = registerProperties[attrName];
        if (Array.isArray(ctor)) {
            if (ctor.some(function (f) { return attrValue.constructor === f; })) {
                object[attrName] = attrValue;
            }
            else {
                Utility.warn("TypeError for attribute \"" + attrName + "\"", object, attrValue);
            }
            return;
        }
        switch (registerProperties[attrName]) {
            case Function:
            case Object:
            case Array:
                if (attrValue.constructor !== registerProperties[attrName]) {
                    Utility.warn("TypeError for attribute \"" + attrName + "\"", object, attrValue);
                }
                else {
                    object[attrName] = attrValue;
                }
                break;
            case Boolean:
                if (attrValue === 'true') {
                    object[attrName] = true;
                }
                else if (attrValue === 'false') {
                    object[attrName] = false;
                }
                else {
                    object[attrName] = !!attrValue;
                }
                break;
            case Number:
                attrValue = Number(attrValue);
                if (!isNaN(attrValue)) {
                    object[attrName] = attrValue;
                }
                break;
            case String:
                if (Object.prototype.toString.call(attrValue) === '[object Object]') {
                    var values = Object.keys(attrValue).filter(function (name) { return !!attrValue[name]; });
                    if (values.length) {
                        object[attrName] = values[values.length - 1];
                    }
                }
                else {
                    attrValue = String(attrValue);
                    object[attrName] = attrValue;
                }
                break;
        }
    };
    return ViewManager;
}());

var Watcher = (function () {
    function Watcher(component, exp, isDeepWatch) {
        this.component = component;
        this.exp = exp;
        this.isDeepWatch = isDeepWatch;
        this.callbacks = [];
        this.observers = {};
        this.properties = {};
        this.isActived = true;
        this.hasInterpolation = Parser.hasInterpolation(exp);
        this.valueGetter = this.hasInterpolation ? Parser.parseInterpolationToGetter(exp) : Parser.parseToGetter(exp);
        this.propertyChanged = this.propertyChanged.bind(this);
        this.value = this.getValue();
    }
    Watcher.getKey = function (exp, isDeepWatch) {
        return !!isDeepWatch ? exp + '<deep>' : exp;
    };
    Watcher.prototype.addCallback = function (callback) {
        if (!this.isActived) {
            return;
        }
        Utility.addEnsureUniqueArrayItem(callback, this.callbacks);
    };
    Watcher.prototype.removeCallback = function (callback) {
        if (!this.isActived) {
            return;
        }
        Utility.removeItemFromArray(callback, this.callbacks);
        if (!this.callbacks.length) {
            this.destroy();
        }
    };
    Watcher.prototype.destroy = function () {
        var _this = this;
        if (!this.isActived) {
            return;
        }
        Object.keys(this.observers).forEach(function (id) {
            Object.keys(_this.properties[id]).forEach(function (property) {
                _this.observers[id].removeListener(property, _this.propertyChanged);
            });
        });
        var key = Watcher.getKey(this.exp, this.isDeepWatch);
        WatcherManager.removeWatcher(this.component, key);
        this.propertyChanged = this.value = this.component = this.exp = this.valueGetter = null;
        this.callbacks = this.observers = this.properties = this.tmpProperties = this.tmpObservers = null;
        this.isActived = false;
    };
    Watcher.prototype.propertyChanged = function () {
        // Utility.nextTick(this.flush, this);
        this.flush();
    };
    Watcher.prototype.flush = function () {
        var _this = this;
        if (!this.isActived) {
            return;
        }
        var oldValue = this.value;
        var newValue = this.getValue();
        if ((typeof newValue === 'object' && newValue != null) || newValue !== oldValue) {
            this.value = newValue;
            this.callbacks.slice().forEach(function (callback) {
                if (_this.isActived) {
                    callback(newValue, oldValue);
                }
            });
        }
    };
    Watcher.prototype.getValue = function () {
        this.beforeCallValueGetter();
        var newValue = this.valueGetter.call(this.component);
        if (this.isDeepWatch) {
            recusiveVisit(newValue);
        }
        this.afterCallValueGetter();
        return newValue;
    };
    Watcher.prototype.beforeCallValueGetter = function () {
        this.tmpObservers = {};
        this.tmpProperties = {};
        Observable.setBeforeAccessPropertyCallback(this.subscribePropertyChanged.bind(this));
    };
    Watcher.prototype.afterCallValueGetter = function () {
        Observable.setBeforeAccessPropertyCallback(null);
        var _a = this, observers = _a.observers, properties = _a.properties, tmpObservers = _a.tmpObservers, tmpProperties = _a.tmpProperties, propertyChanged = _a.propertyChanged;
        Object.keys(observers).forEach(function (id) {
            var observer = observers[id];
            if (!tmpObservers[id]) {
                Object.keys(properties[id]).forEach(function (property) {
                    observer.removeListener(property, propertyChanged);
                });
            }
            else {
                Object.keys(properties[id]).forEach(function (property) {
                    if (!tmpProperties[id][property]) {
                        observer.removeListener(property, propertyChanged);
                    }
                });
            }
        });
        this.observers = tmpObservers;
        this.properties = tmpProperties;
    };
    Watcher.prototype.subscribePropertyChanged = function (observer, property) {
        var id = Utility.getUid(observer);
        var _a = this, observers = _a.observers, properties = _a.properties, tmpObservers = _a.tmpObservers, tmpProperties = _a.tmpProperties, propertyChanged = _a.propertyChanged;
        if (!tmpObservers[id]) {
            tmpObservers[id] = observer;
            tmpProperties[id] = (_b = {}, _b[property] = true, _b);
            if (!observers[id]) {
                observers[id] = observer;
                properties[id] = (_c = {}, _c[property] = true, _c);
                observer.addListener(property, propertyChanged);
            }
            else if (!properties[id][property]) {
                properties[id][property] = true;
                observer.addListener(property, propertyChanged);
            }
        }
        else if (!tmpProperties[id][property]) {
            tmpProperties[id][property] = true;
            if (!properties[id][property]) {
                observer.addListener(property, propertyChanged);
                properties[id][property] = true;
            }
        }
        var _b, _c;
    };
    return Watcher;
}());
function recusiveVisit(value) {
    if (Utility.isPlainObjectOrObservableObject(value)) {
        Object.keys(value).forEach(function (key) {
            recusiveVisit(value[key]);
        });
    }
    else if (Array.isArray(value)) {
        value.forEach(function (item) {
            recusiveVisit(item);
        });
    }
}

var WatcherManager = (function () {
    function WatcherManager() {
    }
    WatcherManager.watch = function (component, expression, callback, isDeepWatch, immediate) {
        var uid = Utility.getUid(component);
        if (!this.componentWatchers[uid]) {
            this.componentWatchers[uid] = {};
        }
        var key = Watcher.getKey(expression, isDeepWatch);
        if (!this.componentWatchers[uid][key]) {
            this.componentWatchers[uid][key] = new Watcher(component, expression, isDeepWatch);
        }
        var watcher = this.componentWatchers[uid][key];
        var wrappedCallback = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            callback.apply(component, args);
        };
        watcher.addCallback(wrappedCallback);
        if (immediate) {
            wrappedCallback(watcher.value, undefined);
        }
        return function () {
            watcher.removeCallback(wrappedCallback);
        };
    };
    WatcherManager.removeWatcher = function (component, key) {
        var watchers = this.componentWatchers[Utility.getUid(component)];
        if (watchers) {
            delete watchers[key];
        }
    };
    WatcherManager.removeWatchers = function (component) {
        var uid = Utility.getUid(component);
        var watchers = this.componentWatchers[uid];
        if (watchers) {
            Object.keys(watchers).forEach(function (key) {
                watchers[key].destroy();
            });
        }
        delete this.componentWatchers[uid];
    };
    WatcherManager.componentWatchers = {};
    return WatcherManager;
}());

var BindingManager = (function () {
    function BindingManager() {
    }
    BindingManager.registerDirective = function (name, directiveCtor, isTerminal, priority) {
        var _this = this;
        if (this.registeredDirectives[name] != null) {
            Utility.warn("Directive \"" + name + "\" is override.", directiveCtor);
        }
        this.registeredDirectives[name] = { ctor: directiveCtor, isTerminal: isTerminal, priority: priority };
        this.terminalDirectives = Object.keys(this.registeredDirectives)
            .filter(function (name) { return _this.registeredDirectives[name].isTerminal; })
            .sort(function (a, b) { return _this.registeredDirectives[b].priority - _this.registeredDirectives[a].priority; });
    };
    BindingManager.getHighestPriorityTerminal = function (target) {
        return this.terminalDirectives.filter(function (name) { return target[name] != null; })[0];
    };
    BindingManager.isRegisteredDirective = function (name) {
        return this.registeredDirectives[name] != null;
    };
    BindingManager.createBinding = function (component, view, context) {
        var _this = this;
        if (context === void 0) { context = {}; }
        var directives = this.getComponentDirectives(component);
        var startIndex = directives.length;
        if (view.directives) {
            Object.keys(view.directives).forEach(function (name) {
                var exp = view.directives[name];
                if (_this.registeredDirectives[name]) {
                    _this.createDirective(_this.registeredDirectives[name].ctor, exp, component, view, context);
                }
                else if (name.slice(0, 2) === '::') {
                    _this.createAttributeBinding(name.slice(2), exp, component, view.instance, true);
                }
                else if (name[0] === '@') {
                    _this.createEventBinding(name.slice(1), exp, component, view.instance);
                }
                else if (name[0] === ':') {
                    _this.createAttributeBinding(name.slice(1), exp, component, view.instance);
                }
                else if (Parser.hasInterpolation(exp)) {
                    _this.createAttributeBinding(name, exp, component, view.instance);
                }
                else {
                    Utility.warn("Unknow directive '" + name + "=\"" + exp + "\".'");
                }
            });
        }
        if (view.isComponent) {
            var context_1 = {};
            if (view.nestChild) {
                view.nestChild.forEach(function (v) { return _this.createBinding(component, v, context_1); });
            }
            if (view.child) {
                view.child.forEach(function (v) { return _this.createBinding(view.instance, v, context_1); });
            }
        }
        else if (view.child) {
            view.child.forEach(function (v) { return _this.createBinding(component, v, context); });
        }
        return directives.slice(startIndex);
    };
    BindingManager.removeBinding = function (component) {
        var _this = this;
        var uid = Utility.getUid(component);
        var directives = this.componentDirectives[uid];
        if (directives) {
            directives.slice().forEach(function (directive) { return _this.removeDirective(component, directive); });
            delete this.componentDirectives[uid];
        }
    };
    BindingManager.createDirective = function (ctor, expression, component, view, context) {
        var directive = new ctor();
        if (typeof directive.onInit === 'function') {
            directive.onInit(expression, component, view, context);
        }
        this.addDirective(component, directive);
    };
    BindingManager.addDirective = function (component, directive) {
        if (Utility.addEnsureUniqueArrayItem(directive, this.getComponentDirectives(component))) {
            this.activedDirectives[Utility.getUid(directive)] = true;
        }
    };
    BindingManager.getComponentDirectives = function (component) {
        var uid = Utility.getUid(component);
        if (!this.componentDirectives[uid]) {
            this.componentDirectives[uid] = [];
        }
        return this.componentDirectives[uid];
    };
    BindingManager.removeDirective = function (component, directive) {
        var uid = Utility.getUid(directive);
        var directives = this.componentDirectives[Utility.getUid(component)];
        if (!this.activedDirectives[uid] || !directives) {
            return;
        }
        if (typeof directive.onDestroy === 'function') {
            directive.onDestroy();
        }
        Utility.removeItemFromArray(directive, directives);
        delete this.activedDirectives[uid];
    };
    BindingManager.createAttributeBinding = function (attrName, expression, component, view, twoWayBinding) {
        var value;
        var unWatchComponent = WatcherManager.watch(component, expression, function (newValue, oldValue) {
            value = newValue;
            ViewManager.setAttribute(view, attrName, newValue);
        }, true, true);
        var unWatchView = twoWayBinding && WatcherManager.watch(view, attrName, function (newValue, oldValue) {
            if (value === newValue) {
                return;
            }
            ViewManager.setAttribute(component, expression, newValue);
        }, true);
        var directive = {
            onDestroy: function () {
                unWatchComponent();
                unWatchView && unWatchView();
            },
        };
        this.addDirective(component, directive);
    };
    BindingManager.createEventBinding = function (eventName, expression, component, view) {
        var hasAddListener = typeof view.addListener === 'function';
        var hasEmitter = view.emitter instanceof canvas2djs.EventEmitter;
        if (!hasEmitter && !hasAddListener) {
            return Utility.error("Could not register event '@" + eventName + "=\"" + expression + "\"', the view is not an EventEmitter like object.", view);
        }
        var func = Parser.parseToFunction(expression);
        var handler = function (e) {
            func.call(component, window, e, view);
        };
        var directive = {
            onDestroy: function () {
                if (hasAddListener) {
                    view.removeListener(eventName, handler);
                }
                else {
                    view.emitter.removeListener(eventName, handler);
                }
            }
        };
        if (hasAddListener) {
            view.addListener(eventName, handler);
        }
        else {
            view.emitter.addListener(eventName, handler);
        }
        this.addDirective(component, directive);
    };
    BindingManager.activedDirectives = {};
    BindingManager.terminalDirectives = [];
    BindingManager.registeredDirectives = {};
    BindingManager.componentDirectives = {};
    return BindingManager;
}());
function Directive(name, isTerminal, priority) {
    return function (ctor) {
        BindingManager.registerDirective(name, ctor, isTerminal, priority);
    };
}
/**
 * @Directive(":repeat")
 * class RepeatDirective {
 *     onInit(component, views) {
 *
 *     }
 * }
 */

var ComponentManager = (function () {
    function ComponentManager() {
    }
    ComponentManager.registerComponent = function (name, ctor) {
        if (this.registeredComponentCtors[name] != null) {
            Utility.warn("Component \"" + name + "\" is override,", ctor);
        }
        this.registeredComponentCtors[name] = ctor;
    };
    ComponentManager.registerBaseComponent = function (name, ctor, extendComponentName) {
        if (this.registeredBaseComponentCtors[name] != null) {
            Utility.warn("Component \"" + name + "\" is override,", ctor);
        }
        this.registeredBaseComponentCtors[name] = ctor;
        if (extendComponentName == null) {
            return;
        }
        var properties = this.getRegisteredBaseComponentPropertiesByName(extendComponentName);
        if (properties == null) {
            Utility.warn("Component \"" + extendComponentName + "\" has not registered properties.");
        }
        else {
            this.registerComponentProperties(ctor, properties);
        }
    };
    ComponentManager.registerComponentProperty = function (component, property, type) {
        var uid = Utility.getUid(component.constructor);
        if (!this.registeredComponentProperties[uid]) {
            this.registeredComponentProperties[uid] = {};
        }
        this.registeredComponentProperties[uid][property] = type;
    };
    ComponentManager.registerComponentProperties = function (componentCtor, properties) {
        var uid = Utility.getUid(componentCtor);
        if (!this.registeredComponentProperties[uid]) {
            this.registeredComponentProperties[uid] = {};
        }
        this.registeredComponentProperties[uid] = __assign({}, this.registeredComponentProperties[uid], properties);
    };
    ComponentManager.createComponentByName = function (name) {
        var ctor = this.registeredComponentCtors[name];
        if (!ctor) {
            Utility.error("Component \"" + name + "\" not found.");
        }
        var instance = new ctor();
        var modelSource = this.createComponentModelSource(instance);
        var registeredProperties = this.getRegisteredComponentPropertiesByName(name);
        if (registeredProperties) {
            Object.keys(registeredProperties).forEach(function (property) {
                var value = instance[property];
                Utility.createProxy(instance, property, modelSource);
                ObservableObject.setProperty(modelSource, property, value);
            });
        }
        if (typeof instance.onInit === "function") {
            instance.onInit();
        }
        return instance;
    };
    ComponentManager.createComponentByConstructor = function (ctor) {
        var instance = new ctor();
        var modelSource = this.createComponentModelSource(instance);
        var registeredProperties = this.getRegisteredComponentProperties(instance);
        if (registeredProperties) {
            Object.keys(registeredProperties).forEach(function (property) {
                var value = instance[property];
                Utility.createProxy(instance, property, modelSource);
                ObservableObject.setProperty(modelSource, property, value);
            });
        }
        if (typeof instance.onInit === "function") {
            instance.onInit();
        }
        return instance;
    };
    ComponentManager.mountComponent = function (component, view) {
        if (typeof component.onBeforeMount === 'function') {
            component.onBeforeMount(view);
        }
        BindingManager.createBinding(component, view);
        if (typeof component.onAfterMounted === 'function') {
            component.onAfterMounted();
        }
    };
    ComponentManager.getBaseComponentCtorByName = function (name) {
        return this.registeredBaseComponentCtors[name];
    };
    ComponentManager.getRegisteredBaseComponentPropertiesByName = function (name) {
        var ctor = this.registeredBaseComponentCtors[name];
        return ctor && this.registeredComponentProperties[Utility.getUid(ctor)];
    };
    ComponentManager.getRegisteredComponentPropertiesByName = function (name) {
        var ctor = this.registeredComponentCtors[name];
        return ctor && this.registeredComponentProperties[Utility.getUid(ctor)];
    };
    ComponentManager.getRegisteredComponentProperties = function (component) {
        var ctor = component.constructor;
        return ctor && this.registeredComponentProperties[Utility.getUid(ctor)];
    };
    ComponentManager.destroyComponent = function (component) {
        if (typeof component.onDestroy === 'function') {
            component.onDestroy();
        }
        BindingManager.removeBinding(component);
        WatcherManager.removeWatchers(component);
        var uid = Utility.getUid(component);
        var properties = this.getRegisteredComponentProperties(component);
        if (properties) {
            Object.keys(properties).forEach(function (property) {
                delete component[property];
            });
        }
        delete this.componentModelSources[uid];
    };
    ComponentManager.createComponentModelSource = function (component) {
        var modelSource = Observable.toObservable({});
        var uid = Utility.getUid(component);
        this.componentModelSources[uid] = modelSource;
        return modelSource;
    };
    ComponentManager.componentModelSources = {};
    ComponentManager.registeredComponentProperties = {};
    ComponentManager.registeredComponentCtors = {};
    ComponentManager.registeredBaseComponentCtors = {};
    return ComponentManager;
}());
function Component(name) {
    return function (componentCtor) {
        ComponentManager.registerComponent(name, componentCtor);
    };
}
function Property(type) {
    if (type === void 0) { type = String; }
    return function (component, property) {
        ComponentManager.registerComponentProperty(component, property, type);
    };
}
function BaseComponent(name, extendComponentName) {
    return function (componentCtor) {
        ComponentManager.registerBaseComponent(name, componentCtor, extendComponentName);
    };
}
/**
 * @Component("Button")
 * class Button {
 *     @Property(String)
 *     label: string;
 * }
 */

/**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
var PATH_REGEXP = new RegExp([
    // Match already escaped characters that would otherwise incorrectly appear
    // in future matches. This allows the user to escape special characters that
    // shouldn't be transformed.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
    // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]
    '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',
    // Match regexp special characters that should always be escaped.
    '([.+*?=^!:${}()[\\]|\\/])'
].join('|'), 'g');
/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup(group) {
    return group.replace(/([=!:$\/()])/g, '\\$1');
}
/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
var attachKeys = function (re, keys) {
    re.keys = keys;
    return re;
};
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array should be passed in, which will contain the placeholder key
 * names. For example `/user/:id` will then contain `["id"]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 keys
 * @param  {Object}                options
 * @return {RegExp}
 */
function pathToRegexp(path, keys, options) {
    if (keys && !Array.isArray(keys)) {
        options = keys;
        keys = null;
    }
    keys = keys || [];
    options = options || {};
    var strict = options.strict;
    var end = options.end !== false;
    var flags = options.sensitive ? '' : 'i';
    var index = 0;
    if (path instanceof RegExp) {
        // Match all capturing groups of a regexp.
        var groups = path.source.match(/\((?!\?)/g) || [];
        // Map all the matches to their numeric keys and push into the keys.
        keys.push.apply(keys, groups.map(function (match, index) {
            return {
                name: index,
                delimiter: null,
                optional: false,
                repeat: false
            };
        }));
        // Return the source back to the user.
        return attachKeys(path, keys);
    }
    if (Array.isArray(path)) {
        // Map array parts into regexps and return their source. We also pass
        // the same keys and options instance into every generation to get
        // consistent matching groups before we join the sources together.
        path = path.map(function (value) {
            return pathToRegexp(value, keys, options).source;
        });
        // Generate a new regexp instance by joining all the parts together.
        return attachKeys(new RegExp('(?:' + path.join('|') + ')', flags), keys);
    }
    // Alter the path string into a usable regexp.
    path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {
        // Avoiding re-escaping escaped characters.
        if (escaped) {
            return escaped;
        }
        // Escape regexp special characters.
        if (escape) {
            return '\\' + escape;
        }
        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        keys.push({
            name: key || index++,
            delimiter: prefix || '/',
            optional: optional,
            repeat: repeat
        });
        // Escape the prefix character.
        prefix = prefix ? '\\' + prefix : '';
        // Match using the custom capturing group, or fallback to capturing
        // everything up to the next slash (or next period if the param was
        // prefixed with a period).
        capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');
        // Allow parameters to be repeated more than once.
        if (repeat) {
            capture = capture + '(?:' + prefix + capture + ')*';
        }
        // Allow a parameter to be optional.
        if (optional) {
            return '(?:' + prefix + '(' + capture + '))?';
        }
        // Basic parameter support.
        return prefix + '(' + capture + ')';
    });
    // Check whether the path ends in a slash as it alters some match behaviour.
    var endsWithSlash = path[path.length - 1] === '/';
    // In non-strict mode we allow an optional trailing slash in the match. If
    // the path to match already ended with a slash, we need to remove it for
    // consistency. The slash is only valid at the very end of a path match, not
    // anywhere in the middle. This is important for non-ending mode, otherwise
    // "/test/" will match "/test//route".
    if (!strict) {
        path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';
    }
    // In non-ending mode, we need prompt the capturing groups to match as much
    // as possible by using a positive lookahead for the end or next path segment.
    if (!end) {
        path += strict && endsWithSlash ? '' : '(?=\\/|$)';
    }
    return attachKeys(new RegExp('^' + path + (end ? '$' : ''), flags), keys);
}

var basePathMap = {};
var altasMap = {};
var loadedResources = {};

(function (ResourceType) {
    ResourceType[ResourceType["Image"] = 0] = "Image";
    ResourceType[ResourceType["Altas"] = 1] = "Altas";
    ResourceType[ResourceType["Json"] = 2] = "Json";
    ResourceType[ResourceType["Audio"] = 3] = "Audio";
    ResourceType[ResourceType["HtmlTemplate"] = 4] = "HtmlTemplate";
    ResourceType[ResourceType["JsonTemplate"] = 5] = "JsonTemplate";
})(exports.ResourceType || (exports.ResourceType = {}));
var Loader = (function () {
    function Loader() {
    }
    Loader.clear = function () {
        loadedResources = {};
    };
    Loader.load = function (resources, version, onCompleted, onProgress, onError) {
        var _this = this;
        var loaded = 0;
        var result = [];
        resources.forEach(function (res, i) {
            switch (res.type) {
                case exports.ResourceType.Altas:
                    _this.loadAltas(res.url, version, function (success, altas) {
                        if (success) {
                            result[i] = altas;
                        }
                        else {
                            onError(exports.ResourceType.Altas, res.url, version);
                        }
                        checkComplete();
                    }, null, onError);
                    break;
                case exports.ResourceType.Image:
                    _this.loadImage(res.url, res.url, version, function (success, img) {
                        if (success) {
                            result[i] = img;
                        }
                        else {
                            onError(exports.ResourceType.Image, res.url, version);
                        }
                        checkComplete();
                    });
                    break;
                case exports.ResourceType.Json:
                    _this.loadJson(res.url, version, function (success, resp) {
                        if (success) {
                            result[i] = resp;
                        }
                        else {
                            onError(exports.ResourceType.Json, res.url, version);
                        }
                        checkComplete();
                    });
                    break;
                case exports.ResourceType.Audio:
                    _this.loadAudio(res.url, version, function (success, audios) {
                        if (success) {
                            result[i] = audios;
                        }
                        else {
                            onError(exports.ResourceType.Audio, res.url, version);
                        }
                        checkComplete();
                    });
                    break;
                case exports.ResourceType.HtmlTemplate:
                    _this.loadHtmlTemplate(res.url, version, function (success, html) {
                        if (success) {
                            result[i] = html;
                        }
                        else {
                            onError(exports.ResourceType.HtmlTemplate, res.url, version);
                        }
                        checkComplete();
                    });
                    break;
                case exports.ResourceType.JsonTemplate:
                    _this.loadJsonTemplate(res.url, version, function (success, json) {
                        if (success) {
                            result[i] = json;
                        }
                        else {
                            onError(exports.ResourceType.JsonTemplate, res.url, version);
                        }
                        checkComplete();
                    });
                    break;
            }
        });
        function checkComplete() {
            loaded += 1;
            onProgress && onProgress(loaded / resources.length);
            // console.log(result);
            if (loaded === resources.length) {
                onCompleted(result);
            }
        }
    };
    Loader.loadAltas = function (url, version, onComplete, onProgress, onError) {
        var _this = this;
        var requestUrl = url + '?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }
        return this.loadJson(url, version, function (success, data) {
            if (!success) {
                if (onError) {
                    onError(exports.ResourceType.Altas, url, version);
                }
                return onComplete(false);
            }
            var images = data.meta.image.split(",");
            var basePath = getBasePath(url);
            var namePrefix = getBasePath(data.meta.prefix);
            var imgs = [];
            var altas = altasMap[url] = {};
            var loaded = 0;
            images.forEach(function (name) {
                _this.loadImage(name, basePath + name, version, function (success, img) {
                    if (!success && onError) {
                        onError(exports.ResourceType.Image, basePath + name, version);
                    }
                    imgs.push(img);
                    loaded += 1;
                    onProgress && onProgress(loaded / images.length);
                    if (loaded === images.length) {
                        onAllDone();
                    }
                });
            });
            function onAllDone() {
                for (var name in data.frames) {
                    var obj = data.frames[name];
                    var img = imgs[obj.frame.idx || 0];
                    var sourceRect = { x: obj.frame.x, y: obj.frame.y, width: obj.frame.w, height: obj.frame.h };
                    var textureRect = { x: obj.spriteSourceSize.x, y: obj.spriteSourceSize.y, width: obj.sourceSize.w, height: obj.sourceSize.h };
                    var texture = canvas2djs.Texture.create(img, sourceRect, textureRect);
                    canvas2djs.Texture.cacheAs(namePrefix + name, texture);
                    altas[name] = texture;
                }
                loadedResources[requestUrl] = altas;
                onComplete(true, altas);
            }
        });
    };
    Loader.loadImage = function (name, url, version, onComplete) {
        var requestUrl = url + '?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }
        var img = new Image();
        img.onload = function () {
            var texture = canvas2djs.Texture.create(img);
            canvas2djs.Texture.cacheAs(name, texture);
            canvas2djs.Texture.cacheAs(url, texture);
            loadedResources[requestUrl] = img;
            onComplete(true, img);
        };
        img.onerror = function () {
            onComplete(false, img);
        };
        img.src = requestUrl;
    };
    Loader.loadAudio = function (url, version, onComplete) {
        var requestUrl = url + '?v=' + version;
        var basePath = getBasePath(url);
        var filePath = url.slice(basePath.length);
        var ext = filePath.match(/\.[^.]+$/)[0];
        var name = filePath.slice(0, filePath.length - ext.length);
        canvas2djs.Sound.ext = ext;
        canvas2djs.Sound.load(basePath, name, function (loaded) {
            var audioes = canvas2djs.Sound.getAllAudioes(name);
            if (loaded) {
                loadedResources[requestUrl] = audioes;
            }
            onComplete(loaded, audioes);
        }, 3);
    };
    Loader.loadJson = function (url, version, onComplete) {
        var requestUrl = url + '?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }
        Request.getJson(requestUrl, function (res) {
            loadedResources[requestUrl] = res;
            onComplete(true, res);
        }, function () {
            console.error("Error in loading JSON file \"" + url + "\" width version \"" + version + "\"");
        });
    };
    Loader.loadHtmlTemplate = function (url, version, onComplete) {
        var requestUrl = url + '.html?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }
        Request.get(requestUrl, function (html) {
            loadedResources[requestUrl] = html;
            TemplateManager.registerHtmlTemplate(url, html);
            onComplete(true, html);
        }, function () {
            console.error("Error in loading Text file \"" + url + "\" width version \"" + version + "\"");
        });
    };
    Loader.loadJsonTemplate = function (url, version, onComplete) {
        var requestUrl = url + '.json?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }
        Request.getJson(requestUrl, function (json) {
            loadedResources[requestUrl] = json;
            TemplateManager.registerJsonTemplate(url, json);
            onComplete(true, json);
        }, function () {
            console.error("Error in loading Text file \"" + url + "\" width version \"" + version + "\"");
        });
    };
    Loader.getAltas = function (url) {
        return altasMap[url];
    };
    return Loader;
}());
function getBasePath(url) {
    if (!basePathMap[url]) {
        var split = url.indexOf("/") >= 0 ? "/" : "\\";
        var idx = url.lastIndexOf(split);
        basePathMap[url] = idx >= 0 ? url.substr(0, idx + 1) : "";
    }
    return basePathMap[url];
}

var ContainerProps = { left: 0, right: 0, top: 0, bottom: 0 };
var Application = (function () {
    function Application() {
        this.loadedComponents = [];
        this.routers = [];
        this.currScene = new canvas2djs.Sprite(ContainerProps);
        this.loadingScene = new canvas2djs.Sprite(ContainerProps);
    }
    Application.prototype.getStage = function () {
        return this.stage;
    };
    Application.prototype.setVersion = function (version) {
        this.version = version;
    };
    Application.prototype.getVersion = function () {
        return this.version;
    };
    Application.prototype.createLoadingScene = function (options) {
        this.loadingSceneResources = options.resources;
        this.loadingSceneTemplate = options.template;
        this.onLoadingError = options.onLoadingError;
        this.onLoadingProgress = options.onLoadingProgress;
        this.onLoaded = options.onLoaded || (function (a, b, next) { return next(); });
        this.onLoadStart = options.onLoadStart;
        this.loadingSceneComponent = ComponentManager.createComponentByName(options.component);
    };
    Application.prototype.createStage = function (stageProps) {
        this.stage = new canvas2djs.Stage(stageProps.canvas, stageProps.width, stageProps.height, stageProps.scaleMode, !!stageProps.autoAdjustCanvasSize, stageProps.orientation);
        this.stage.mouseEnabled = !!stageProps.mouseEnabled;
        this.stage.touchEnabled = !!stageProps.touchEnabled;
    };
    Application.prototype.setIndexUrl = function (indexUrl) {
        this.indexUrl = indexUrl;
    };
    Application.prototype.navigate = function (url, replaceState) {
        var navigateUrl = '#' + url;
        if (replaceState) {
            location.replace(navigateUrl);
        }
        else {
            location.href = navigateUrl;
        }
    };
    Application.prototype.registerRouter = function (routerOptions) {
        var _this = this;
        Object.keys(routerOptions).forEach(function (path) {
            var options = routerOptions[path];
            var reg = pathToRegexp(path);
            var params = reg.keys.map(function (key) { return key.name; });
            delete reg.keys;
            _this.routers.push(__assign({}, options, { reg: reg,
                path: path,
                params: params }));
        });
    };
    Application.prototype.start = function (url) {
        if (url === void 0) { url = location.hash.slice(1); }
        if (this.version == null) {
            Utility.error("Application version required.");
        }
        this.registerHashChangeEvent();
        this.initLoadingScene();
        this.onUrlChanged(url);
    };
    Application.prototype.parseState = function (url) {
        var saveParam = function (param, j) {
            params[param] = result[j + 1];
        };
        var result;
        var params;
        for (var i = 0; i < this.routers.length; i++) {
            var router = this.routers[i];
            if (router.reg.test(url)) {
                result = router.reg.exec(url);
                params = {};
                router.params.forEach(saveParam);
                return {
                    state: {
                        url: url,
                        path: router.path,
                        params: params,
                    },
                    router: router,
                };
            }
        }
    };
    Application.prototype.destroy = function () {
        this.loadingSceneComponent && ComponentManager.destroyComponent(this.loadingSceneComponent);
        this.currComponent && ComponentManager.destroyComponent(this.currComponent);
        this.stage.release();
        this.loadingScene = this.loadingSceneComponent = null;
        this.currRouter = this.currScene = this.currComponent = null;
        this.stage = null;
    };
    Application.prototype.onUrlChanged = function (url) {
        var _this = this;
        var result;
        if (!url || !(result = this.parseState(url))) {
            if (this.indexUrl === url) {
                Utility.error("Invalid index url \"" + this.indexUrl + "\"");
            }
            return this.navigate(this.indexUrl, true);
        }
        var state = result.state, router = result.router;
        if (this.currRouter && this.currRouter.onLeave) {
            this.currRouter.onLeave(state);
        }
        if (router.onEnter) {
            router.onEnter(state, function () {
                _this.replaceState(state, router);
            });
        }
        else {
            this.replaceState(state, router);
        }
    };
    Application.prototype.replaceState = function (state, router) {
        this.lastState = this.currState;
        this.currState = state;
        if (this.currComponent) {
            if (this.currComponentName === router.component) {
                if (typeof this.currComponent.onEnter === 'function') {
                    this.currComponent.onEnter(state, this.lastState);
                }
                return;
            }
            ComponentManager.destroyComponent(this.currComponent);
            this.currComponent = null;
            this.currScene.children && this.currScene.children.forEach(function (c) { return c.release(true); });
        }
        this.loadComponentResource(router);
    };
    Application.prototype.loadComponentResource = function (router) {
        var _this = this;
        this.currRouter = router;
        if (!this.isLoadingSceneReady) {
            return;
        }
        if (this.loadedComponents.indexOf(router.component) < 0) {
            this.setLoadingState(true);
            this.onLoadStart && this.onLoadStart(this.loadingSceneComponent, router.component);
            Loader.load(router.resources, this.version, function () {
                Utility.addEnsureUniqueArrayItem(router.component, _this.loadedComponents);
                _this.onLoaded(_this.loadingSceneComponent, router.component, function () {
                    if (_this.currRouter === router) {
                        _this.createComponent(router);
                    }
                });
            }, function (loadedPercent) {
                _this.onLoadingProgress && _this.onLoadingProgress(_this.loadingSceneComponent, router.component, loadedPercent);
            }, function (type, url, version) {
                _this.onLoadingError && _this.onLoadingError(_this.loadingSceneComponent, type, url, version);
            });
        }
        else {
            this.createComponent(router);
        }
    };
    Application.prototype.createComponent = function (router) {
        var view = ViewManager.createView(TemplateManager.getTemplateByName(router.template));
        var component = ComponentManager.createComponentByName(router.component);
        ComponentManager.mountComponent(component, view);
        if (typeof component.onEnter === 'function') {
            component.onEnter(this.currState, this.lastState);
        }
        this.currComponentName = router.component;
        this.currComponent = component;
        this.currScene.addChild(view.sprite);
        this.setLoadingState(false);
    };
    Application.prototype.initLoadingScene = function () {
        var _this = this;
        Loader.load(this.loadingSceneResources, this.version, function () {
            var view = ViewManager.createView(TemplateManager.getTemplateByName(_this.loadingSceneTemplate));
            _this.loadingScene.addChild(view.sprite);
            ComponentManager.mountComponent(_this.loadingSceneComponent, view);
            _this.isLoadingSceneReady = true;
            if (_this.currRouter) {
                _this.loadComponentResource(_this.currRouter);
            }
        }, null, function (type, url, version) {
            _this.onLoadingError && _this.onLoadingError(_this.loadingSceneComponent, type, url, version);
        });
    };
    Application.prototype.setLoadingState = function (isLoading) {
        if (isLoading) {
            if (this.currScene.parent) {
                this.stage.removeChild(this.currScene);
            }
            if (!this.loadingScene.parent) {
                this.stage.addChild(this.loadingScene, 0);
            }
        }
        else {
            if (!this.currScene.parent) {
                this.stage.addChild(this.currScene, 0);
            }
            if (this.loadingScene.parent) {
                this.stage.removeChild(this.loadingScene);
            }
        }
    };
    Application.prototype.registerHashChangeEvent = function () {
        var _this = this;
        window.addEventListener("hashchange", function () {
            _this.onUrlChanged(location.hash.slice(1));
        });
    };
    return Application;
}());

/**
 * 需要记录的历史速度的最大次数。
 */
var MAX_VELOCITY_COUNT = 4;
/**
 * 记录的历史速度的权重列表。
 */
var VELOCITY_WEIGHTS = [1, 1.33, 1.66, 2];
/**
 * 当前速度所占的权重。
 */
var CURRENT_VELOCITY_WEIGHT = 2.33;
/**
 * 最小的改变速度，解决浮点数精度问题。
 */
var MINIMUM_VELOCITY = 0.02;
/**
 * 当容器自动滚动时要应用的摩擦系数
 */
var FRICTION = 0.998;
/**
 * 当容器自动滚动时并且滚动位置超出容器范围时要额外应用的摩擦系数
 */
var EXTRA_FRICTION = 0.95;
/**
 * 摩擦系数的自然对数
 */
var FRICTION_LOG = Math.log(FRICTION);
var TouchScroll = (function () {
    function TouchScroll(onUpdate, onEnded) {
        this.onUpdate = onUpdate;
        this.onEnded = onEnded;
        this.offsetPos = 0;
        this.currentPos = 0;
        this.previousPos = 0;
        this.maxScrollPos = 0;
        this.previousTime = 0;
        this.velocity = 0;
        this.previousVelocity = [];
        this._currScrollPos = 0;
        this.bounce = true;
        this.scrollFactor = 1;
    }
    Object.defineProperty(TouchScroll.prototype, "currScrollPos", {
        get: function () {
            return this._currScrollPos;
        },
        set: function (value) {
            this._currScrollPos = value;
            if (this.onUpdate) {
                this.onUpdate(this._currScrollPos);
            }
        },
        enumerable: true,
        configurable: true
    });
    TouchScroll.prototype.start = function (position) {
        this.stop();
        this.offsetPos = position;
        this.currentPos = this.previousPos = position;
        this.previousTime = Date.now();
        this.previousVelocity.length = 0;
        this.startTick();
    };
    TouchScroll.prototype.stop = function () {
        if (this.action) {
            this.action.stop();
            this.action = null;
        }
        this.velocity = 0;
        this.stopTick();
    };
    TouchScroll.prototype.update = function (touchPos, maxScrollPos, scrollValue) {
        maxScrollPos = Math.max(0, maxScrollPos);
        this.currentPos = touchPos;
        this.maxScrollPos = maxScrollPos;
        var disMove = this.offsetPos - touchPos;
        var scrollPos = disMove + scrollValue;
        this.offsetPos = touchPos;
        if (scrollPos < 0) {
            if (!this.bounce) {
                scrollPos = 0;
            }
            else {
                scrollPos -= disMove * 0.5;
            }
        }
        if (scrollPos > maxScrollPos) {
            if (!this.bounce) {
                scrollPos = maxScrollPos;
            }
            else {
                scrollPos -= disMove * 0.5;
            }
        }
        this.currScrollPos = scrollPos;
    };
    TouchScroll.prototype.finish = function (currScrollPos, maxScrollPos) {
        this.stopTick();
        var sum = this.velocity * CURRENT_VELOCITY_WEIGHT;
        var prevVelocityX = this.previousVelocity;
        var length = this.previousVelocity.length;
        var totalWeight = CURRENT_VELOCITY_WEIGHT;
        for (var i = 0; i < length; i++) {
            var weight = VELOCITY_WEIGHTS[i];
            sum += prevVelocityX[i] * weight;
            totalWeight += weight;
        }
        var pixelsPerMS = sum / totalWeight;
        var absPixelsPerMS = Math.abs(pixelsPerMS);
        var duration = 0;
        var posTo = 0;
        if (absPixelsPerMS > MINIMUM_VELOCITY) {
            posTo = currScrollPos + (pixelsPerMS - MINIMUM_VELOCITY) / FRICTION_LOG * 2 * this.scrollFactor;
            if (posTo < 0 || posTo > maxScrollPos) {
                posTo = currScrollPos;
                while (Math.abs(pixelsPerMS) > MINIMUM_VELOCITY) {
                    posTo -= pixelsPerMS;
                    if (posTo < 0 || posTo > maxScrollPos) {
                        pixelsPerMS *= FRICTION * EXTRA_FRICTION;
                    }
                    else {
                        pixelsPerMS *= FRICTION;
                    }
                    duration += 1;
                }
            }
            else {
                duration = Math.log(MINIMUM_VELOCITY / absPixelsPerMS) / FRICTION_LOG;
            }
        }
        else {
            posTo = currScrollPos;
        }
        if (duration > 0) {
            if (!this.bounce) {
                if (posTo < 0) {
                    posTo = 0;
                }
                else if (posTo > maxScrollPos) {
                    posTo = maxScrollPos;
                }
            }
            this.throwTo(posTo, duration);
        }
        else {
            this.finishScrolling();
        }
    };
    TouchScroll.prototype.onTick = function () {
        var now = Date.now();
        var timeOffset = now - this.previousTime;
        if (timeOffset > 10) {
            var previousVelocity = this.previousVelocity;
            if (previousVelocity.length >= MAX_VELOCITY_COUNT) {
                previousVelocity.shift();
            }
            this.velocity = (this.currentPos - this.previousPos) / timeOffset;
            previousVelocity.push(this.velocity);
            this.previousTime = now;
            this.previousPos = this.currentPos;
        }
        this.startTick();
    };
    TouchScroll.prototype.throwTo = function (posTo, duration) {
        var _this = this;
        var currScrollPos = this._currScrollPos;
        if (currScrollPos === posTo) {
            return this.onEnded();
        }
        if (this.action) {
            this.action.stop();
        }
        this.action = new canvas2djs.Action(this).to({
            currScrollPos: {
                dest: posTo,
                easing: easeOut
            }
        }, duration / 1000).then(function () {
            _this.finishScrolling();
        }).start();
    };
    TouchScroll.prototype.finishScrolling = function () {
        var posTo = this._currScrollPos;
        var maxScrollPos = this.maxScrollPos;
        if (posTo < 0) {
            posTo = 0;
        }
        else if (posTo > maxScrollPos) {
            posTo = maxScrollPos;
        }
        this.throwTo(posTo, 300);
    };
    TouchScroll.prototype.startTick = function () {
        var _this = this;
        this.stopTick();
        this.timerId = setTimeout(function () { return _this.onTick(); });
    };
    TouchScroll.prototype.stopTick = function () {
        clearTimeout(this.timerId);
        this.timerId = null;
    };
    return TouchScroll;
}());
function easeOut(ratio) {
    var invRatio = ratio - 1.0;
    return invRatio * invRatio * invRatio + 1;
}

var SpriteProperties = {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    scaleX: Number,
    scaleY: Number,
    originX: Number,
    originY: Number,
    bgColor: [String, Number],
    radius: Number,
    borderWidth: Number,
    borderColor: [String, Number],
    texture: String,
    rotation: Number,
    opacity: Number,
    visible: Boolean,
    alignX: Number,
    alignY: Number,
    flippedX: Boolean,
    flippedY: Boolean,
    clipOverflow: Boolean,
    top: Number,
    right: Number,
    bottom: Number,
    left: Number,
    percentWidth: Number,
    percentHeight: Number,
    grid: Array,
    sourceX: Number,
    sourceY: Number,
    sourceWidth: Number,
    sourceHeight: Number,
    blendMode: Number,
    autoResize: Boolean,
    touchEnabled: Boolean,
    mouseEnabled: Boolean,
};
var TextLabelProperties = __assign({}, SpriteProperties, { text: String, fontName: String, textAlign: String, fontColor: [String, Number], fontSize: Number, lineHeight: Number, fontStyle: String, fontWeight: String, strokeColor: [String, Number], strokeWidth: Number, wordWrap: Boolean, textFlow: Array, autoResizeWidth: Boolean });
var BMFontLabelProperties = __assign({}, SpriteProperties, { textureMap: Object, text: String, textAlign: String, wordWrap: Boolean, wordSpace: Number, lineHeight: Number, fontSize: Number, autoResizeHeight: Boolean });
// var ScrollViewProperties = {
//     ...SpriteProperties,
//     bounce: Boolean,
//     horizentalScroll: Boolean,
//     verticalScroll: Boolean,
// };
// var AutoLayoutViewProperties = {
//     ...ScrollViewProperties,
//     layout: Number,
//     verticalSpacing: Number,
//     horizentalSpacing: Number,
// };
// var AutoResizeViewProperties = {
//     ...SpriteProperties,
//     layout: Number,
//     marginLeft: Number,
//     marginRight: Number,
//     marginTop: Number,
//     marginBottom: Number,
//     verticalSpacing: Number,
//     horizentalSpacing: Number,
//     alignChild: Number,
// };
ComponentManager.registerBaseComponent("sprite", canvas2djs.Sprite);
// ComponentManager.registerBaseComponent("text", TextLabel);
// ComponentManager.registerBaseComponent("bmfont", BMFontLabel);
ComponentManager.registerComponentProperties(canvas2djs.Sprite, SpriteProperties);
ComponentManager.registerComponentProperties(canvas2djs.TextLabel, TextLabelProperties);
ComponentManager.registerComponentProperties(canvas2djs.BMFontLabel, BMFontLabelProperties);
// ComponentManager.registerComponentProperties(ScrollView, ScrollViewProperties);
// ComponentManager.registerComponentProperties(AutoLayoutView, AutoLayoutViewProperties);
// ComponentManager.registerComponentProperties(AutoResizeView, AutoResizeViewProperties);

var ScrollView = (function (_super) {
    __extends(ScrollView, _super);
    function ScrollView(props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, __assign({}, props, { clipOverflow: true })) || this;
        _this.scrollPos = { x: 0, y: 0 };
        _this.size = { width: 0, height: 0 };
        _this.onUpdateHorizentalScroll = function (scrollX) {
            _this.scroller.x = -scrollX;
            _this.scrollPos.x = scrollX;
            _this.onScroll && _this.onScroll(__assign({}, _this.scrollPos));
            _this.emit(ScrollView_1.SCROLL, __assign({}, _this.scrollPos));
        };
        _this.onUpdateVerticalScroll = function (scrollY) {
            _this.scroller.y = -scrollY;
            _this.scrollPos.y = scrollY;
            _this.onScroll && _this.onScroll(__assign({}, _this.scrollPos));
            _this.emit(ScrollView_1.SCROLL, __assign({}, _this.scrollPos));
        };
        _this.onTouchBeginHandler = function (helpers) {
            if (!_this.horizentalScroll && !_this.verticalScroll) {
                return;
            }
            var helper = helpers[0];
            _this.beginPosId = helper.identifier;
            _this.beginPos = { x: helper.stageX, y: helper.stageY };
            if (_this.horizentalScroll) {
                _this.touchScrollHorizental.start(helper.stageX);
            }
            if (_this.verticalScroll) {
                _this.touchScrollVertical.start(helper.stageY);
            }
            // helper.stopPropagation();
            _this.stage.on(canvas2djs.UIEvent.TOUCH_MOVED, _this.onTouchMovedHandler);
            _this.stage.on(canvas2djs.UIEvent.TOUCH_ENDED, _this.onTouchEndedHandler);
        };
        _this.onTouchMovedHandler = function (helpers) {
            if (!_this.beginPos) {
                return;
            }
            var touchPoint = helpers.filter(function (e) { return e.identifier === _this.beginPosId; })[0];
            if (!touchPoint) {
                return;
            }
            var beginPos = _this.beginPos;
            if (_this.horizentalScroll && Math.abs(touchPoint.stageX - beginPos.x) >= ScrollView_1.scrollThreshold) {
                _this.touchScrollHorizental.update(touchPoint.stageX, _this.size.width - _this.width, _this.scrollPos.x);
            }
            if (_this.verticalScroll && Math.abs(touchPoint.stageY - beginPos.y) >= ScrollView_1.scrollThreshold) {
                _this.touchScrollVertical.update(touchPoint.stageY, _this.size.height - _this.height, _this.scrollPos.y);
            }
            touchPoint.stopPropagation();
        };
        _this.onTouchEndedHandler = function (e) {
            _this.stage.removeListener(canvas2djs.UIEvent.TOUCH_MOVED, _this.onTouchMovedHandler);
            _this.stage.removeListener(canvas2djs.UIEvent.TOUCH_ENDED, _this.onTouchEndedHandler);
            if (!_this.beginPos) {
                return;
            }
            if (_this.horizentalScroll) {
                _this.touchScrollHorizental.finish(_this.scrollPos.x, _this.size.width - _this.width);
            }
            if (_this.verticalScroll) {
                _this.touchScrollVertical.finish(_this.scrollPos.y, _this.size.height - _this.height);
            }
            e[0].stopPropagation();
            _this.beginPos = _this.beginPosId = null;
        };
        _this.scroller = new canvas2djs.Sprite({
            originX: 0,
            originY: 0,
            percentWidth: 1,
            percentHeight: 1,
        });
        _this.scroller.addChild = function (target, position) {
            canvas2djs.Sprite.prototype.addChild.call(this, target, position);
            this.parent && this.parent.updateView();
        };
        _this.scroller.removeChild = function (target) {
            canvas2djs.Sprite.prototype.removeChild.call(this, target);
            this.parent && this.parent.updateView();
        };
        _this.bounce = _this.bounce == null ? true : _this.bounce;
        _super.prototype.addChild.call(_this, _this.scroller);
        _this.touchScrollHorizental = new TouchScroll(_this.onUpdateHorizentalScroll, function () { });
        _this.touchScrollVertical = new TouchScroll(_this.onUpdateVerticalScroll, function () { });
        _this.touchScrollHorizental.bounce = _this.touchScrollVertical.bounce = _this.bounce;
        _this.on(canvas2djs.UIEvent.TOUCH_BEGIN, _this.onTouchBeginHandler);
        return _this;
    }
    ScrollView_1 = ScrollView;
    ScrollView.prototype.addChild = function (child, position) {
        this.scroller.addChild(child, position);
        this.updateView();
    };
    ScrollView.prototype.removeChild = function (child) {
        this.scroller.removeChild(child);
        this.updateView();
    };
    ScrollView.prototype.removeAllChildren = function (recusive) {
        this.scroller.removeAllChildren(recusive);
    };
    ScrollView.prototype.getScrollerSize = function () {
        return __assign({}, this.size);
    };
    ScrollView.prototype._onChildResize = function () {
        this.updateView();
        _super.prototype._onChildResize.call(this);
    };
    ScrollView.prototype.updateView = function () {
        if (!this.stage) {
            return;
        }
        var width = 0;
        var height = 0;
        if (this.scroller.children) {
            this.scroller.children.forEach(function (sprite) {
                var right = sprite.x + sprite.width - sprite._originPixelX;
                var bottom = sprite.y + sprite.height - sprite._originPixelY;
                if (right > width) {
                    width = right;
                }
                if (bottom > height) {
                    height = bottom;
                }
            });
        }
        if (height < this.size.height && this.verticalScroll) {
            this.onUpdateVerticalScroll(0);
        }
        if (width < this.size.width && this.horizentalScroll) {
            this.onUpdateHorizentalScroll(0);
        }
        this.size = { width: width, height: height };
    };
    ScrollView.prototype.release = function (recusive) {
        this.touchScrollHorizental.stop();
        this.touchScrollVertical.stop();
        _super.prototype.removeChild.call(this, this.scroller);
        _super.prototype.release.call(this, recusive);
    };
    ScrollView.SCROLL = "scroll";
    ScrollView.scrollThreshold = 5;
    __decorate([
        Property(Boolean)
    ], ScrollView.prototype, "horizentalScroll", void 0);
    __decorate([
        Property(Boolean)
    ], ScrollView.prototype, "verticalScroll", void 0);
    __decorate([
        Property(Boolean)
    ], ScrollView.prototype, "bounce", void 0);
    ScrollView = ScrollView_1 = __decorate([
        BaseComponent("ScrollView", "sprite")
    ], ScrollView);
    return ScrollView;
    var ScrollView_1;
}(canvas2djs.Sprite));

(function (Layout) {
    Layout[Layout["Vertical"] = 0] = "Vertical";
    Layout[Layout["Horizontal"] = 1] = "Horizontal";
})(exports.Layout || (exports.Layout = {}));
var AutoLayoutView = (function (_super) {
    __extends(AutoLayoutView, _super);
    function AutoLayoutView(props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, __assign({}, props)) || this;
        _this._layout = _this._layout == null ? exports.Layout.Horizontal : _this._layout;
        _this._horizentalAlign = _this._horizentalAlign == null ? canvas2djs.AlignType.CENTER : _this._horizentalAlign;
        _this._verticalAlign = _this._verticalAlign == null ? canvas2djs.AlignType.CENTER : _this._verticalAlign;
        _this._autoResizeHeight = _this._autoResizeHeight == null ? false : _this._autoResizeHeight;
        _this._verticalSpacing = _this._verticalSpacing || 0;
        _this._horizentalSpacing = _this._horizentalSpacing || 0;
        return _this;
    }
    Object.defineProperty(AutoLayoutView.prototype, "horizentalAlign", {
        get: function () {
            return this._horizentalAlign;
        },
        set: function (value) {
            if (value !== this._horizentalAlign) {
                this._horizentalAlign = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoLayoutView.prototype, "verticalAlign", {
        get: function () {
            return this._verticalAlign;
        },
        set: function (value) {
            if (value !== this._verticalAlign) {
                this._verticalAlign = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoLayoutView.prototype, "layout", {
        get: function () {
            return this._layout;
        },
        set: function (value) {
            if (value !== this._layout) {
                this._layout = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoLayoutView.prototype, "autoResizeHeight", {
        get: function () {
            return this._autoResizeHeight;
        },
        set: function (value) {
            if (this._autoResizeHeight !== value) {
                this._autoResizeHeight = value;
                if (value) {
                    this.height = this.size.height;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoLayoutView.prototype, "verticalSpacing", {
        get: function () {
            return this._verticalSpacing;
        },
        set: function (value) {
            if (value !== this._verticalSpacing) {
                this._verticalSpacing = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoLayoutView.prototype, "horizentalSpacing", {
        get: function () {
            return this._horizentalSpacing;
        },
        set: function (value) {
            if (value !== this._horizentalSpacing) {
                this._horizentalSpacing = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    AutoLayoutView.prototype.addChild = function (target, position) {
        canvas2djs.Sprite.prototype.addChild.call(this.scroller, target, position);
        this.updateView();
    };
    AutoLayoutView.prototype.removeChild = function (target) {
        canvas2djs.Sprite.prototype.removeChild.call(this.scroller, target);
        this.updateView();
    };
    AutoLayoutView.prototype.updateView = function () {
        var _this = this;
        if (!this.scroller.children || !this.scroller.children.length) {
            this.size = { width: 0, height: 0 };
            if (this._autoResizeHeight) {
                this.height = 0;
            }
            if (this.verticalScroll) {
                this.touchScrollVertical.stop();
            }
            if (this.horizentalScroll) {
                this.touchScrollVertical.stop();
            }
            return;
        }
        var children = this.scroller.children;
        var _a = this, width = _a.width, height = _a.height, verticalSpacing = _a.verticalSpacing, horizentalSpacing = _a.horizentalSpacing;
        var maxHeight = 0;
        var maxWidth = 0;
        var x = 0;
        var y = 0;
        var beginIndex = 0;
        var count = 0;
        var prevExist;
        if (this.layout === exports.Layout.Horizontal) {
            var list_1 = [];
            children.forEach(function (sprite, index) {
                // sprite.left = null;
                if (sprite.width === 0) {
                    return;
                }
                var spacing = (prevExist ? horizentalSpacing : 0);
                var right = x + sprite.width + spacing;
                if (right <= width || index === 0) {
                    // sprite.x = x + (sprite as any)._originPixelX + spacing;
                    list_1.push(sprite);
                    x = right;
                    prevExist = true;
                }
                else {
                    _this.applyHorizentalAlign(list_1, x);
                    y += count > 0 ? verticalSpacing : 0;
                    _this.alignChildHorizental(beginIndex, index - 1, children, y, maxHeight);
                    beginIndex = index;
                    y += maxHeight;
                    x = sprite.width;
                    // sprite.x = (sprite as any)._originPixelX;
                    list_1 = [sprite];
                    maxHeight = 0;
                    count += 1;
                }
                if (sprite.height > maxHeight) {
                    maxHeight = sprite.height;
                }
            });
            this.applyHorizentalAlign(list_1, x);
            y += count > 0 ? verticalSpacing : 0;
            this.alignChildHorizental(beginIndex, children.length - 1, children, y, maxHeight);
        }
        else if (this.layout === exports.Layout.Vertical) {
            var list_2 = [];
            children.forEach(function (sprite, index) {
                if (sprite.height === 0) {
                    return;
                }
                var spacing = (prevExist ? verticalSpacing : 0);
                var bottom = y + sprite.height;
                if (bottom <= height || index === 0) {
                    // sprite.y = y + (sprite as any)._originPixelY + spacing;
                    list_2.push(sprite);
                    y = bottom;
                    prevExist = true;
                }
                else {
                    _this.applayVerticalAlign(list_2, y);
                    x += count > 0 ? horizentalSpacing : 0;
                    _this.alignChildVirtical(beginIndex, index - 1, children, x, maxWidth);
                    beginIndex = index;
                    x += maxWidth;
                    y = sprite.height;
                    // sprite.y = (sprite as any)._originPixelY;
                    list_2 = [sprite];
                    maxWidth = 0;
                    count += 1;
                }
                if (sprite.width > maxWidth) {
                    maxWidth = sprite.width;
                }
            });
            this.applayVerticalAlign(list_2, y);
            x += count > 0 ? horizentalSpacing : 0;
            this.alignChildVirtical(beginIndex, children.length - 1, children, x, maxWidth);
        }
        else {
            Utility.warn("Unknow layout", this.layout);
        }
        _super.prototype.updateView.call(this);
        if (this._autoResizeHeight) {
            this.height = this.size.height;
        }
    };
    AutoLayoutView.prototype.applyHorizentalAlign = function (sprites, totalWidth) {
        var horizentalSpacing = this._horizentalSpacing;
        var startX = 0;
        if (this._horizentalAlign === canvas2djs.AlignType.CENTER) {
            startX = (this.width - totalWidth) * 0.5;
        }
        else if (this._horizentalAlign === canvas2djs.AlignType.RIGHT) {
            startX = this.width - totalWidth;
        }
        sprites.forEach(function (sprite, i) {
            var spacing = (i > 0 ? horizentalSpacing : 0);
            sprite.x = startX + sprite._originPixelX + spacing;
            startX += sprite.width + spacing;
        });
    };
    AutoLayoutView.prototype.applayVerticalAlign = function (sprites, totalHeight) {
        var verticalSpacing = this._verticalSpacing;
        var startY = 0;
        if (this._verticalAlign === canvas2djs.AlignType.CENTER) {
            startY = (this.height - totalHeight) * 0.5;
        }
        else if (this._verticalAlign === canvas2djs.AlignType.BOTTOM) {
            startY = this.height - totalHeight;
        }
        sprites.forEach(function (sprite, i) {
            var spacing = (i > 0 ? verticalSpacing : 0);
            sprite.y = startY + sprite._originPixelY + spacing;
            startY += sprite.height + spacing;
        });
    };
    AutoLayoutView.prototype.alignChildVirtical = function (begin, end, sprites, x, width) {
        if (end < begin) {
            return;
        }
        var align = this._horizentalAlign;
        if (align === canvas2djs.AlignType.LEFT) {
            for (var i = begin; i <= end; i++) {
                var sprite = sprites[i];
                sprite.x = x + sprite._originPixelX;
            }
        }
        else if (align === canvas2djs.AlignType.RIGHT) {
            for (var i = begin; i <= end; i++) {
                var sprite = sprites[i];
                sprite.x = x + width - sprite.width + sprite._originPixelX;
            }
        }
        else {
            for (var i = begin; i <= end; i++) {
                var sprite = sprites[i];
                sprite.x = x + (width - sprite.width) * 0.5 + sprite._originPixelX;
            }
        }
    };
    AutoLayoutView.prototype.alignChildHorizental = function (begin, end, sprites, y, height) {
        if (end < begin) {
            return;
        }
        var align = this._verticalAlign;
        if (align === canvas2djs.AlignType.TOP) {
            for (var i = begin; i <= end; i++) {
                var sprite = sprites[i];
                sprite.y = y + sprite._originPixelY;
            }
        }
        else if (align === canvas2djs.AlignType.BOTTOM) {
            for (var i = begin; i <= end; i++) {
                var sprite = sprites[i];
                sprite.y = y + height - sprite.height + sprite._originPixelY;
            }
        }
        else {
            for (var i = begin; i <= end; i++) {
                var sprite = sprites[i];
                sprite.y = y + (height - sprite.height) * 0.5 + sprite._originPixelY;
            }
        }
    };
    __decorate([
        Property(Number)
    ], AutoLayoutView.prototype, "horizentalAlign", null);
    __decorate([
        Property(Number)
    ], AutoLayoutView.prototype, "verticalAlign", null);
    __decorate([
        Property(Number)
    ], AutoLayoutView.prototype, "layout", null);
    __decorate([
        Property(Boolean)
    ], AutoLayoutView.prototype, "autoResizeHeight", null);
    __decorate([
        Property(Number)
    ], AutoLayoutView.prototype, "verticalSpacing", null);
    __decorate([
        Property(Number)
    ], AutoLayoutView.prototype, "horizentalSpacing", null);
    AutoLayoutView = __decorate([
        BaseComponent("AutoLayoutView", "ScrollView")
    ], AutoLayoutView);
    return AutoLayoutView;
}(ScrollView));

var AutoResizeView = (function (_super) {
    __extends(AutoResizeView, _super);
    function AutoResizeView(props) {
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, __assign({}, props)) || this;
        _this._marginTop = _this._marginTop || 0;
        _this._marginRight = _this._marginRight || 0;
        _this._marginBottom = _this._marginBottom || 0;
        _this._marginLeft = _this._marginLeft || 0;
        _this._verticalSpacing = _this._verticalSpacing || 0;
        _this._horizentalSpacing = _this._horizentalSpacing || 0;
        _this._layout = _this._layout == null ? exports.Layout.Horizontal : _this._layout;
        _this._alignChild = _this._alignChild == null ? canvas2djs.AlignType.CENTER : _this._alignChild;
        return _this;
    }
    Object.defineProperty(AutoResizeView.prototype, "marginLeft", {
        get: function () {
            return this._marginLeft;
        },
        set: function (value) {
            if (value !== this._marginLeft) {
                this._marginLeft = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoResizeView.prototype, "marginRight", {
        get: function () {
            return this._marginRight;
        },
        set: function (value) {
            if (value !== this._marginRight) {
                this._marginRight = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoResizeView.prototype, "marginBottom", {
        get: function () {
            return this._marginBottom;
        },
        set: function (value) {
            if (value !== this._marginBottom) {
                this._marginBottom = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoResizeView.prototype, "marginTop", {
        get: function () {
            return this._marginTop;
        },
        set: function (value) {
            if (value !== this._marginTop) {
                this._marginTop = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoResizeView.prototype, "verticalSpacing", {
        get: function () {
            return this._verticalSpacing;
        },
        set: function (value) {
            if (value !== this._verticalSpacing) {
                this._verticalSpacing = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoResizeView.prototype, "horizentalSpacing", {
        get: function () {
            return this._horizentalSpacing;
        },
        set: function (value) {
            if (value !== this._horizentalSpacing) {
                this._horizentalSpacing = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoResizeView.prototype, "layout", {
        get: function () {
            return this._layout;
        },
        set: function (value) {
            if (value !== this._layout) {
                this._layout = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoResizeView.prototype, "alignChild", {
        get: function () {
            return this._alignChild;
        },
        set: function (value) {
            if (value !== this._alignChild) {
                this._alignChild = value;
                this.updateView();
            }
        },
        enumerable: true,
        configurable: true
    });
    AutoResizeView.prototype.addChild = function (target, position) {
        _super.prototype.addChild.call(this, target, position);
        this.updateView();
    };
    AutoResizeView.prototype.removeChild = function (target) {
        _super.prototype.removeChild.call(this, target);
        this.updateView();
    };
    AutoResizeView.prototype._onChildResize = function () {
        this.updateView();
        _super.prototype._onChildResize.call(this);
    };
    AutoResizeView.prototype.updateView = function () {
        if (!this.children || !this.children.length) {
            this.width = 0;
            this.height = 0;
            return;
        }
        var _a = this, layout = _a.layout, alignChild = _a.alignChild, children = _a.children, marginLeft = _a.marginLeft, marginRight = _a.marginRight, marginBottom = _a.marginBottom, marginTop = _a.marginTop, verticalSpacing = _a.verticalSpacing, horizentalSpacing = _a.horizentalSpacing;
        var height;
        var width;
        var count = 0;
        if (layout === exports.Layout.Horizontal) {
            width = marginLeft;
            height = 0;
            children.forEach(function (sprite, index) {
                if (sprite.width === 0 || !sprite.visible) {
                    return;
                }
                if (sprite.height > height) {
                    height = sprite.height;
                }
                var spacing = count > 0 ? horizentalSpacing : 0;
                sprite.x = width + sprite._originPixelX + spacing;
                width += sprite.width + spacing;
                count += 1;
            });
            if (width > marginLeft) {
                this.width = width + marginRight;
            }
            else {
                this.width = 0;
            }
            if (height != 0) {
                if (alignChild === canvas2djs.AlignType.TOP) {
                    this.children.forEach(function (sprite) {
                        sprite.y = marginTop + sprite._originPixelY;
                    });
                }
                else if (alignChild === canvas2djs.AlignType.BOTTOM) {
                    this.children.forEach(function (sprite) {
                        sprite.y = marginTop + height - sprite.height + sprite._originPixelY;
                    });
                }
                else {
                    this.children.forEach(function (sprite) {
                        sprite.y = marginTop + (height - sprite.height) * 0.5 + sprite._originPixelY;
                    });
                }
                height += marginTop + marginBottom;
                this.height = height;
            }
            else {
                this.height = 0;
            }
        }
        else if (layout === exports.Layout.Vertical) {
            width = 0;
            height = marginTop;
            children.forEach(function (sprite, index) {
                if (sprite.height === 0 || !sprite.visible) {
                    return;
                }
                if (sprite.width > width) {
                    width = sprite.width;
                }
                var spacing = count > 0 ? verticalSpacing : 0;
                sprite.y = height + sprite._originPixelY + spacing;
                height += sprite.height + spacing;
                count += 1;
            });
            if (height > marginTop) {
                this.height = height + marginBottom;
            }
            else {
                this.height = 0;
            }
            if (width != 0) {
                if (alignChild === canvas2djs.AlignType.LEFT) {
                    this.children.forEach(function (sprite) {
                        sprite.x = marginLeft + sprite._originPixelX;
                    });
                }
                else if (alignChild === canvas2djs.AlignType.RIGHT) {
                    this.children.forEach(function (sprite) {
                        sprite.x = marginLeft + width - sprite.width + sprite._originPixelX;
                    });
                }
                else {
                    this.children.forEach(function (sprite) {
                        sprite.x = marginLeft + (width - sprite.width) * 0.5 + sprite._originPixelX;
                    });
                }
                width += marginLeft + marginRight;
                this.width = width;
            }
            else {
                this.width = 0;
            }
        }
    };
    __decorate([
        Property(Number)
    ], AutoResizeView.prototype, "marginLeft", null);
    __decorate([
        Property(Number)
    ], AutoResizeView.prototype, "marginRight", null);
    __decorate([
        Property(Number)
    ], AutoResizeView.prototype, "marginBottom", null);
    __decorate([
        Property(Number)
    ], AutoResizeView.prototype, "marginTop", null);
    __decorate([
        Property(Number)
    ], AutoResizeView.prototype, "verticalSpacing", null);
    __decorate([
        Property(Number)
    ], AutoResizeView.prototype, "horizentalSpacing", null);
    __decorate([
        Property(Number)
    ], AutoResizeView.prototype, "layout", null);
    __decorate([
        Property(Number)
    ], AutoResizeView.prototype, "alignChild", null);
    AutoResizeView = __decorate([
        BaseComponent("AutoResizeView", "sprite")
    ], AutoResizeView);
    return AutoResizeView;
}(canvas2djs.Sprite));

var WeakRef = (function () {
    function WeakRef() {
    }
    WeakRef.set = function (ref, source, target) {
        var uid = Utility.getUid(source);
        if (!this.weakRefTable[uid]) {
            this.weakRefTable[uid] = {};
        }
        if (this.weakRefTable[uid][ref] != null) {
            Utility.warn("Reference \"" + ref + "\" target is override", target, "Source:", source);
        }
        this.weakRefTable[uid][ref] = target;
    };
    WeakRef.get = function (ref, source) {
        var uid = Utility.getUid(source);
        return this.weakRefTable[uid] && this.weakRefTable[uid][ref];
    };
    WeakRef.remove = function (ref, source) {
        var uid = Utility.getUid(source);
        var table = this.weakRefTable[uid];
        if (table) {
            delete table[ref];
            if (Object.keys(table).length === 0) {
                delete this.weakRefTable[uid];
            }
        }
    };
    WeakRef.clear = function (source) {
        delete this.weakRefTable[Utility.getUid(source)];
    };
    WeakRef.weakRefTable = {};
    return WeakRef;
}());

var regParam = /\s+in\s+/;
var regComma = /\s*,\s*/;
var regTrackby = /trackby\s+(\w+)/;
var IncludeDirective = (function () {
    function IncludeDirective() {
    }
    IncludeDirective.prototype.onInit = function (templateName, component, view, context) {
        this.view = view;
        this.component = component;
        this.parentSprite = view.sprite.parent;
        var node = TemplateManager.getTemplateByName(templateName);
        if (node == null) {
            return Utility.warn("Error updating directive ':include=\"" + templateName + "\", template \"" + templateName + "\" not found.'");
        }
        var newView = ViewManager.createView(node);
        this.parentSprite.replaceChild(view.sprite, newView.sprite);
        this.directives = BindingManager.createBinding(this.component, newView);
        this.currSprite = newView.sprite;
    };
    IncludeDirective.prototype.removeTemplate = function () {
        var _this = this;
        if (this.directives) {
            this.directives.forEach(function (directive) {
                BindingManager.removeDirective(_this.component, directive);
            });
            this.parentSprite.replaceChild(this.currSprite, this.view.sprite);
            this.directives = this.currSprite = null;
        }
    };
    IncludeDirective.prototype.onDestroy = function () {
        this.removeTemplate();
        this.view = this.component = null;
    };
    IncludeDirective = __decorate([
        Directive(":include")
    ], IncludeDirective);
    return IncludeDirective;
}());
var ConditionDirective = (function () {
    function ConditionDirective() {
    }
    ConditionDirective.prototype.onInit = function (expression, component, view, context) {
        var _this = this;
        this.view = view;
        this.component = component;
        this.parentSprite = view.sprite.parent;
        this.unWatch = WatcherManager.watch(component, expression, function (newValue) {
            _this.onUpdate(!!newValue);
        }, true, true);
    };
    ConditionDirective.prototype.onUpdate = function (newValue) {
        if (newValue && !this.directives) {
            var newView = ViewManager.createView(this.view.node);
            this.parentSprite.replaceChild(this.view.sprite, newView.sprite);
            this.currSprite = newView.sprite;
            this.directives = BindingManager.createBinding(this.component, newView);
        }
        else if (!newValue) {
            this.removeBinding();
        }
    };
    ConditionDirective.prototype.removeBinding = function () {
        var _this = this;
        if (this.directives) {
            this.directives.forEach(function (directive) {
                BindingManager.removeDirective(_this.component, directive);
            });
            this.parentSprite.replaceChild(this.currSprite, this.view.sprite);
            this.currSprite = this.directives = null;
        }
    };
    ConditionDirective.prototype.onDestroy = function () {
        this.removeBinding();
        this.unWatch();
        this.component = this.view = this.unWatch = this.parentSprite = null;
    };
    ConditionDirective = __decorate([
        Directive(":if", true, 200)
    ], ConditionDirective);
    return ConditionDirective;
}());
var SlotToDirective = (function () {
    function SlotToDirective() {
    }
    SlotToDirective.prototype.onInit = function (name, component, view, context) {
        if (!context.slotViews) {
            context.slotViews = {};
        }
        if (!context.slotViews[name]) {
            context.slotViews[name] = [];
        }
        context.slotViews[name].push(view);
    };
    SlotToDirective = __decorate([
        Directive(":slot-to")
    ], SlotToDirective);
    return SlotToDirective;
}());
var SlotPlaceholderDirective = (function () {
    function SlotPlaceholderDirective() {
    }
    SlotPlaceholderDirective.prototype.onInit = function (name, component, view, context) {
        if (!(view.instance instanceof canvas2djs.Sprite)) {
            return Utility.error("Component could not use the slot=\"" + name + "\" directive.", view);
        }
        if (!context.slotViews || !context.slotViews[name]) {
            return;
        }
        var slotViews = context.slotViews[name];
        var placeholder = view.instance;
        var slotSprites = slotViews.map(function (v) { return v.sprite; });
        (_a = placeholder.parent).replaceChild.apply(_a, [placeholder].concat(slotSprites));
        var _a;
    };
    SlotPlaceholderDirective = __decorate([
        Directive(":slot")
    ], SlotPlaceholderDirective);
    return SlotPlaceholderDirective;
}());
var ReferenceDirective = (function () {
    function ReferenceDirective() {
    }
    ReferenceDirective.prototype.onInit = function (refName, component, view, context) {
        this.refName = refName;
        this.component = component;
        WeakRef.set(refName, component, view.instance);
    };
    ReferenceDirective.prototype.onDestroy = function () {
        WeakRef.remove(this.refName, this.component);
        this.refName = this.component = null;
    };
    ReferenceDirective = __decorate([
        Directive(":ref")
    ], ReferenceDirective);
    return ReferenceDirective;
}());
/**
 * :for="item in list trackby id"
 */
var ForLoopDirective = (function () {
    function ForLoopDirective() {
    }
    ForLoopDirective_1 = ForLoopDirective;
    ForLoopDirective.prototype.onInit = function (expression, component, view, context) {
        var _this = this;
        this.refKey = "component:" + Utility.getUid(this);
        this.view = view;
        this.component = component;
        this.itemDatas = [];
        this.originalExp = expression;
        this.parseExpression(expression);
        this.unWatch = WatcherManager.watch(component, this.expression, function (newValue, oldValue) {
            _this.onUpdate(newValue, oldValue);
        }, true, true);
    };
    ForLoopDirective.prototype.onUpdate = function (newValue, oldValue) {
        var _this = this;
        var itemDatas = this.itemDatas = this.toList(newValue);
        var notAnyItems = !this.itemComponents || this.itemComponents.length === 0;
        var newItemComponents = [];
        itemDatas.forEach(function (item, index) {
            var itemComponent = newItemComponents[index] = _this.getItemComponentByItem(item);
            itemComponent.__idle__ = false;
        });
        if (!notAnyItems) {
            this.removeItemComponents();
        }
        newItemComponents.forEach(function (itemVm) { return itemVm.__idle__ = true; });
        this.itemComponents = newItemComponents;
    };
    ForLoopDirective.prototype.getItemComponentByItem = function (item) {
        var value = item.value;
        var itemComponent;
        if (this.trackByKey) {
            if (this.itemComponents) {
                var trackValue = value[this.trackKey];
                for (var i = 0; itemComponent = this.itemComponents[i]; i++) {
                    if (itemComponent[this.keyValueName.value][this.trackKey] === trackValue) {
                        if (!itemComponent.__idle__) {
                            Utility.warn("\"" + this.trackKey + "\" is not an unique key in directive ':for=\"" + this.originalExp + "\"'");
                        }
                        break;
                    }
                }
            }
        }
        else {
            var components = WeakRef.get(this.refKey, value);
            if (components) {
                for (var i = 0; itemComponent = components[i]; i++) {
                    if (itemComponent.__idle__) {
                        break;
                    }
                }
            }
        }
        if (itemComponent) {
            this.updateItemComponent(itemComponent, item);
        }
        else {
            itemComponent = this.createItemComponent(item);
            var view = ViewManager.createView(this.view.node);
            var parent = this.view.sprite.parent;
            var index = Math.max(0, parent.children.indexOf(this.view.sprite)) - (this.itemComponents ? this.itemComponents.length : 0) + item.index;
            parent.addChild(view.sprite, index);
            BindingManager.createBinding(itemComponent, view);
            WeakRef.set(this.refKey, itemComponent, view.sprite);
        }
        return itemComponent;
    };
    ForLoopDirective.prototype.updateItemComponent = function (component, item) {
        var _a = this.keyValueName, key = _a.key, value = _a.value;
        component.$index = item.index;
        component.$isOdd = 0 === item.index % 2;
        component.$isEven = !component.$isOdd;
        component.$isLast = item.index === this.itemDatas.length - 1;
        component.$isFirst = 0 === item.index;
        if (key != null) {
            component[key] = item.key;
        }
        component[value] = item.value;
    };
    ForLoopDirective.prototype.createItemComponent = function (item) {
        var value = item.value;
        var itemComponent = ComponentManager.createComponentByConstructor(this.itemComponentCtor);
        if (!this.trackByKey) {
            var itemComponents = WeakRef.get(this.refKey, value);
            if (itemComponents == null) {
                itemComponents = [];
                WeakRef.set(this.refKey, value, itemComponents);
            }
            itemComponents.push(itemComponent);
        }
        itemComponent.$parent = this.component;
        this.updateItemComponent(itemComponent, item);
        return itemComponent;
    };
    ForLoopDirective.prototype.removeItemComponents = function (forceRemove) {
        var _this = this;
        this.itemComponents.forEach(function (itemComponent) {
            if (itemComponent.__idle__ || forceRemove) {
                var value = itemComponent[_this.keyValueName.value];
                var sprite = WeakRef.get(_this.refKey, itemComponent);
                itemComponent.$parent = null;
                ComponentManager.destroyComponent(itemComponent);
                if (sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }
                if (!_this.trackByKey) {
                    var components = WeakRef.get(_this.refKey, value);
                    WeakRef.remove(_this.refKey, itemComponent);
                    Utility.removeItemFromArray(itemComponent, components);
                    if (!components.length) {
                        WeakRef.remove(_this.refKey, value);
                    }
                }
            }
        });
    };
    ForLoopDirective.prototype.parseExpression = function (expression) {
        var parts = expression.split(regParam);
        if (parts.length !== 2) {
            return Utility.error("Invalid directive syntax ':for=\"" + expression + "\"'.");
        }
        var key;
        var value;
        var params = parts[0];
        if (params.indexOf(',') > 0) {
            params = params.split(regComma);
            if (params[0] === '') {
                return Utility.error("Invalid directive syntax ':for=\"" + expression + "\"'.");
            }
            key = params[1];
            value = params[0];
        }
        else {
            value = params;
        }
        if (!ForLoopDirective_1.itemComponentCtors[expression]) {
            var ctor = function () { };
            var properties = {
                $index: Number,
                $isFirst: Boolean,
                $isLast: Boolean,
                $isOdd: Boolean,
                $isEven: Boolean,
            };
            properties[value] = null;
            if (key) {
                properties[key] = null;
            }
            ForLoopDirective_1.itemComponentCtors[expression] = ctor;
            ComponentManager.registerComponentProperties(ctor, properties);
        }
        var trackby = parts[1].match(regTrackby);
        if (trackby) {
            this.trackByKey = true;
            this.trackKey = trackby[1];
        }
        this.keyValueName = { key: key, value: value };
        this.expression = parts[1].replace(regTrackby, '').trim();
        this.itemComponentCtor = ForLoopDirective_1.itemComponentCtors[expression];
    };
    ForLoopDirective.prototype.toList = function (target) {
        var list = [];
        if (Array.isArray(target)) {
            target.forEach(function (val, idx) {
                list.push({
                    key: idx,
                    index: idx,
                    value: val
                });
            });
        }
        else if (Utility.isPlainObjectOrObservableObject(target)) {
            var idx = 0;
            var key = void 0;
            for (key in target) {
                list.push({
                    key: key,
                    index: idx++,
                    value: target[key]
                });
            }
        }
        else if (typeof target === 'number') {
            for (var i = 0; i < target; i++) {
                list.push({
                    key: i,
                    index: i,
                    value: i
                });
            }
        }
        return list;
    };
    ForLoopDirective.prototype.onDestroy = function () {
        this.removeItemComponents(true);
        this.unWatch();
        this.component = this.unWatch = this.view = this.itemComponentCtor = this.itemComponents = this.itemDatas = null;
    };
    ForLoopDirective.itemComponentCtors = {};
    ForLoopDirective = ForLoopDirective_1 = __decorate([
        Directive(":for", true, 100)
    ], ForLoopDirective);
    return ForLoopDirective;
    var ForLoopDirective_1;
}());

exports.Utility = Utility;
exports.Request = Request;
exports.ComponentManager = ComponentManager;
exports.Component = Component;
exports.Property = Property;
exports.BaseComponent = BaseComponent;
exports.BindingManager = BindingManager;
exports.Directive = Directive;
exports.StyleManager = StyleManager;
exports.TemplateManager = TemplateManager;
exports.processHtml = processHtml;
exports.parseTemplateToVirtualNode = parseTemplateToVirtualNode;
exports.ViewManager = ViewManager;
exports.WatcherManager = WatcherManager;
exports.Observable = Observable;
exports.ObservableArray = ObservableArray;
exports.ObservableObject = ObservableObject;
exports.Observer = Observer;
exports.Parser = Parser;
exports.Watcher = Watcher;
exports.Application = Application;
exports.Loader = Loader;
exports.ScrollView = ScrollView;
exports.AutoLayoutView = AutoLayoutView;
exports.AutoResizeView = AutoResizeView;
exports.WeakRef = WeakRef;
exports.TouchScroll = TouchScroll;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=canvas2d-ui.js.map
