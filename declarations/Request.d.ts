export declare class Request {
    static xhr<T>(options: XHROptions, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function): any;
    static get<T>(url: string, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function): void;
    static post<T>(url: string, data: any, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function): void;
    static getJson<T>(url: string, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function): void;
    static postJson<T>(url: string, data: any, onSuccess?: (res) => T, onError?: (err) => any, onComplete?: Function): void;
}
export declare type XHROptions = {
    url: string;
    method?: string;
    data?: string | {};
    headers?: {
        [key: string]: string;
    };
    withCredentials?: boolean;
    contentType?: string;
    responseType?: XMLHttpRequestResponseType;
    timeout?: number;
    user?: string;
    password?: string;
};
