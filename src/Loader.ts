import { Texture, Sound, WebAudio, HTMLAudio } from 'canvas2djs';
import { Request } from './Request';
import { TemplateManager } from './TemplateManager';
import { Utility } from './Utility';

export enum ResourceType {
    Image,
    Altas,
    Json,
    Audio,
    HtmlTemplate,
    JsonTemplate,
}

export type Resource = {
    url: string;
    type: ResourceType;
    channel?: number; // for ResourceType.Audio
    retryTimes?: number;
};

export class Loader {

    private static audioChannel = 1;
    private static retryTimes = 1;
    private static maxLoading = 5;

    private static basePathMap: { [key: string]: string } = {};
    private static altasMap: { [url: string]: { [name: string]: Texture } } = {};
    private static loadedResources: { [id: string]: any } = {};

    public static getRetryTimes(res: Resource) {
        return res.retryTimes == null ? this.retryTimes : res.retryTimes;
    }

    public static setRetryTimes(times: number) {
        this.retryTimes = times;
    }

    public static setAudioChannel(channel: number) {
        this.audioChannel = channel;
    }

    public static setMaxLoading(maxLoading: number) {
        this.maxLoading = Math.max(1, maxLoading);
    }

    public static clear() {
        this.loadedResources = {};
    }

    public static getRes(url: string, version?: string) {
        let key = version ? url + '?v=' + version : url;
        return this.loadedResources[key];
    }

    public static load(
        resources: Resource[],
        version: string,
        onCompleted: Function,
        onProgress?: (percent: number) => any,
        onError?: (type: ResourceType, url: string, version: string) => any
    ) {
        let loaded = 0;
        let result = [];
        let stepLoaded: number;
        let loadCount: number;

        let logAndReportError = (type: ResourceType, url: string, version: string) => {
            Utility.warn(`Resource [${ResourceType[type]}]"${url}"(version=${version}) loading failed.`);
            onError && onError(type, url, version);
        }
        let loadNext = () => {
            loadCount = Math.min(this.maxLoading, resources.length - loaded);
            stepLoaded = 0;
            for (let i = loaded, l = loaded + loadCount; i < l; i++) {
                let res = resources[i];
                let retryTimes = this.getRetryTimes(res);
                switch (res.type) {
                    case ResourceType.Altas:
                        this.loadAltas(res.url, version, retryTimes, (success, altas) => {
                            if (success) {
                                result[i] = altas;
                            }
                            else {
                                logAndReportError(ResourceType.Altas, res.url, version);
                            }
                            checkComplete();
                        }, null, onError);
                        break;
                    case ResourceType.Image:
                        this.loadImage(res.url, res.url, version, retryTimes, (success, img) => {
                            if (success) {
                                result[i] = img;
                            }
                            else {
                                logAndReportError(ResourceType.Image, res.url, version);
                            }
                            checkComplete();
                        });
                        break;
                    case ResourceType.Json:
                        this.loadJson(res.url, version, retryTimes, (success, resp) => {
                            if (success) {
                                result[i] = resp;
                            }
                            else {
                                logAndReportError(ResourceType.Json, res.url, version);
                            }
                            checkComplete();
                        });
                        break;
                    case ResourceType.Audio:
                        this.loadAudio(res.url, version, res.channel == null ? this.audioChannel : res.channel, retryTimes, (success, audios) => {
                            if (success) {
                                result[i] = audios;
                            }
                            else {
                                logAndReportError(ResourceType.Audio, res.url, version);
                            }
                            checkComplete();
                        });
                        break;
                    case ResourceType.HtmlTemplate:
                        this.loadHtmlTemplate(res.url, version, retryTimes, (success, html) => {
                            if (success) {
                                result[i] = html;
                            }
                            else {
                                logAndReportError(ResourceType.HtmlTemplate, res.url, version);
                            }
                            checkComplete();
                        });
                        break;
                    case ResourceType.JsonTemplate:
                        this.loadJsonTemplate(res.url, version, retryTimes, (success, json) => {
                            if (success) {
                                result[i] = json;
                            }
                            else {
                                logAndReportError(ResourceType.JsonTemplate, res.url, version);
                            }
                            checkComplete();
                        });
                        break;
                }
            }
        }

        loadNext();

        function checkComplete() {
            loaded += 1;
            onProgress && onProgress(loaded / resources.length);
            // console.log(result);
            if (loaded === resources.length) {
                onCompleted(result);
            }
            else if (++stepLoaded === loadCount) {
                loadNext();
            }
        }
    }

    public static loadAltas(url: string, version: string, retryTimes: number, onComplete: Function, onProgress?: (percent: number) => any, onError?: Function) {
        let requestUrl = url + '?v=' + version;
        if (this.loadedResources[requestUrl]) {
            return onComplete(true, this.loadedResources[requestUrl]);
        }

        this.loadJson(url, version, 1, (success: boolean, data: any) => {
            if (!success) {
                if (retryTimes > 0) {
                    return this.loadAltas(url, version, retryTimes - 1, onComplete, onProgress, onError);
                }
                if (onError) {
                    onError(ResourceType.Altas, url, version);
                }
                return onComplete(false);
            }
            let images = data.meta.image.split(",");
            let basePath = this.getBasePath(url);
            let namePrefix = this.getBasePath(data.meta.prefix);
            let imgs: HTMLImageElement[] = [];
            let altas: { [name: string]: Texture } = this.altasMap[url] = {};
            let loaded = 0;

            let onAllDone = () => {
                for (let name in data.frames) {
                    let obj = data.frames[name];
                    let img = imgs[obj.frame.idx || 0];
                    let sourceRect = { x: obj.frame.x, y: obj.frame.y, width: obj.frame.w, height: obj.frame.h };
                    let textureRect = { x: obj.spriteSourceSize.x, y: obj.spriteSourceSize.y, width: obj.sourceSize.w, height: obj.sourceSize.h };
                    let texture = Texture.create(img, sourceRect, textureRect);
                    Texture.cacheAs(namePrefix + name, texture);
                    altas[name] = texture;
                }
                this.loadedResources[requestUrl] = this.loadedResources[url] = altas;
                onComplete(true, altas);
            };

            images.forEach(name => {
                this.loadImage(name, basePath + name, version, this.retryTimes, (success, img) => {
                    if (!success && onError) {
                        onError(ResourceType.Image, basePath + name, version);
                    }

                    imgs.push(img);
                    loaded += 1;
                    onProgress && onProgress(loaded / images.length);
                    if (loaded === images.length) {
                        onAllDone();
                    }
                });
            });
        });
    }

    public static loadImage(name: string, url: string, version: string, retryTimes: number, onComplete: (loaded: boolean, img: HTMLImageElement) => any) {
        let requestUrl = url + '?v=' + version;
        if (this.loadedResources[requestUrl]) {
            return onComplete(true, this.loadedResources[requestUrl]);
        }

        let img = new Image();
        img.onload = () => {
            let texture = Texture.create(img);
            Texture.cacheAs(name, texture);
            Texture.cacheAs(url, texture);
            this.loadedResources[requestUrl] = this.loadedResources[url] = img;
            onComplete(true, img);
            img = null;
        };
        img.onerror = () => {
            if (retryTimes > 0) {
                this.loadImage(name, url, version, retryTimes - 1, onComplete);
            }
            else {
                onComplete(false, img);
            }
            img = null;
        };
        img.crossOrigin = 'anonymous';
        img.src = requestUrl;
    }

    public static loadAudio(url: string, version: string, channel: number, retryTimes: number, onComplete: (loaded: boolean, res: (WebAudio | HTMLAudio)[]) => any) {
        let requestUrl = url + '?v=' + version;
        if (this.loadedResources[requestUrl]) {
            return onComplete(true, this.loadedResources[requestUrl]);
        }

        let basePath = this.getBasePath(url);
        let filePath = url.slice(basePath.length);
        let ext = filePath.match(/\.[^.]+$/)[0];
        let name = filePath.slice(0, filePath.length - ext.length);
        Sound.ext = ext as any;
        Sound.load(basePath, name, (loaded) => {
            let audioes = Sound.getAllAudioes(name);
            if (loaded) {
                this.loadedResources[requestUrl] = this.loadedResources[url] = audioes;
                onComplete(loaded, audioes);
            }
            else if (retryTimes > 0) {
                this.loadAudio(url, version, channel, retryTimes - 1, onComplete);
            }
            else {
                onComplete(loaded, audioes);
            }
        }, channel);
    }

    public static loadJson(url: string, version: string, retryTimes: number, onComplete: Function) {
        let requestUrl = url + '?v=' + version;
        if (this.loadedResources[requestUrl]) {
            return onComplete(true, this.loadedResources[requestUrl]);
        }

        Request.getJson(requestUrl, (res) => {
            this.loadedResources[requestUrl] = this.loadedResources[url] = res;
            onComplete(true, res);
        }, () => {
            if (retryTimes > 0) {
                this.loadJson(url, version, retryTimes - 1, onComplete);
            }
            else {
                onComplete(false, null);
            }
        });
    }

    public static loadHtmlTemplate(url: string, version: string, retryTimes: number, onComplete: Function) {
        let requestUrl = url + '.html?v=' + version;
        if (this.loadedResources[requestUrl]) {
            return onComplete(true, this.loadedResources[requestUrl]);
        }
        Request.get(requestUrl, (html) => {
            this.loadedResources[requestUrl] = this.loadedResources[url] = html;
            TemplateManager.registerHtmlTemplate(url, html);
            onComplete(true, html);
        }, () => {
            if (retryTimes > 0) {
                this.loadHtmlTemplate(url, version, retryTimes - 1, onComplete);
            }
            else {
                onComplete(false, null);
            }
        });
    }

    public static loadJsonTemplate(url: string, version: string, retryTimes: number, onComplete: Function) {
        let requestUrl = url + '.json?v=' + version;
        if (this.loadedResources[requestUrl]) {
            return onComplete(true, this.loadedResources[requestUrl]);
        }
        Request.getJson(requestUrl, (json) => {
            this.loadedResources[requestUrl] = this.loadedResources[url] = json;
            TemplateManager.registerJsonTemplate(url, json);
            onComplete(true, json);
        }, () => {
            if (retryTimes > 0) {
                this.loadJsonTemplate(url, version, retryTimes - 1, onComplete);
            }
            else {
                onComplete(false, null);
            }
        });
    }

    public static getAltas(url: string) {
        return this.altasMap[url];
    }

    private static getBasePath(url: string) {
        if (!this.basePathMap[url]) {
            let split = url.indexOf("/") >= 0 ? "/" : "\\";
            let idx = url.lastIndexOf(split);
            this.basePathMap[url] = idx >= 0 ? url.substr(0, idx + 1) : "";
        }
        return this.basePathMap[url];
    }
}
