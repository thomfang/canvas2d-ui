import { Utility } from './Utility';

const schemeRegex = /^(\w+)\:\/\//;

export class Request {

    public static xhr<T>(options: XHROptions, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function) {
        var xhr = new XMLHttpRequest();

        if (typeof options.url !== 'string' || !options.url) {
            return Utility.error(`xhr(options): Invalid options.url.`);
        }

        let url = options.url;
        let type = (options.method || 'GET').toUpperCase();
        let headers = options.headers || {};
        let data: any = options.data;
        let contentType: string = options.contentType;
        let isLocalRequest = false;
        let schemeMatch = schemeRegex.exec(options.url.toLowerCase());

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

        xhr.onload = () => {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || (isLocalRequest && xhr.status === 0)) {
                    onSuccess && onSuccess(xhr.response);
                }
                else {
                    let contentType = xhr.getResponseHeader('Content-Type');
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
            xhr.responseType = options.responseType as any;
        }

        if (typeof options.timeout === 'number' && options.timeout > 0) {
            xhr.timeout = options.timeout;
            xhr.ontimeout = () => {
                if (xhr) {
                    xhr.abort();
                    onError && onError({ res: { message: "Timeout" }, xhr });
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
    }

    public static get<T>(url: string, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function) {
        this.xhr({ url }, onSuccess, onError, onComplete);
    }

    public static post<T>(url: string, data, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function) {
        this.xhr({ url, method: "POST", data, contentType: "application/json", }, onSuccess, onError, onComplete);
    }

    public static getJson<T>(url: string, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function) {
        this.xhr({ url, responseType: 'json' }, onSuccess, onError, onComplete);
    }

    public static postJson<T>(url: string, data, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function) {
        this.xhr({ url, method: "POST", data, responseType: 'json', contentType: "application/json" }, onSuccess, onError, onComplete);
    }
}

export type XHROptions = {
    url: string;
    method?: string;
    data?: string | {};
    headers?: { [key: string]: string };
    withCredentials?: boolean;
    contentType?: string;
    responseType?: string;
    timeout?: number;
    user?: string;
    password?: string;
}
