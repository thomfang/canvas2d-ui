import { Texture, Sound, WebAudio, HTMLAudio } from 'canvas2djs';
import { Request } from './Request';
import { TemplateManager } from './TemplateManager';
import { Utility } from './Utility';

var basePathMap: { [key: string]: string } = {};
var altasMap: { [url: string]: { [name: string]: Texture } } = {};
var loadedResources: { [id: string]: any } = {};

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
};

export class Loader {

    private static audioChannel = 1;

    public static setAudioChannel(channel: number) {
        this.audioChannel = channel;
    }

    public static clear() {
        loadedResources = {};
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

        resources.forEach((res, i) => {
            switch (res.type) {
                case ResourceType.Altas:
                    this.loadAltas(res.url, version, (success, altas) => {
                        if (success) {
                            result[i] = altas;
                        }
                        else {
                            onError(ResourceType.Altas, res.url, version);
                        }
                        checkComplete();
                    }, null, onError);
                    break;
                case ResourceType.Image:
                    this.loadImage(res.url, res.url, version, (success, img) => {
                        if (success) {
                            result[i] = img;
                        }
                        else {
                            onError(ResourceType.Image, res.url, version);
                        }
                        checkComplete();
                    });
                    break;
                case ResourceType.Json:
                    this.loadJson(res.url, version, (success, resp) => {
                        if (success) {
                            result[i] = resp;
                        }
                        else {
                            onError(ResourceType.Json, res.url, version);
                        }
                        checkComplete();
                    });
                    break;
                case ResourceType.Audio:
                    this.loadAudio(res.url, version, res.channel == null ? this.audioChannel : res.channel, (success, audios) => {
                        if (success) {
                            result[i] = audios;
                        }
                        else {
                            onError(ResourceType.Audio, res.url, version);
                        }
                        checkComplete();
                    });
                    break;
                case ResourceType.HtmlTemplate:
                    this.loadHtmlTemplate(res.url, version, (success, html) => {
                        if (success) {
                            result[i] = html;
                        }
                        else {
                            onError(ResourceType.HtmlTemplate, res.url, version);
                        }
                        checkComplete();
                    });
                    break;
                case ResourceType.JsonTemplate:
                    this.loadJsonTemplate(res.url, version, (success, json) => {
                        if (success) {
                            result[i] = json;
                        }
                        else {
                            onError(ResourceType.JsonTemplate, res.url, version);
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
    }

    public static loadAltas(url: string, version: string, onComplete: Function, onProgress?: (percent: number) => any, onError?: Function) {
        let requestUrl = url + '?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }

        return this.loadJson(url, version, (success: boolean, data: any) => {
            if (!success) {
                if (onError) {
                    onError(ResourceType.Altas, url, version);
                }
                return onComplete(false);
            }
            let images = data.meta.image.split(",");
            let basePath = getBasePath(url);
            let namePrefix = getBasePath(data.meta.prefix);
            let imgs: HTMLImageElement[] = [];
            let altas: { [name: string]: Texture } = altasMap[url] = {};
            let loaded = 0;

            images.forEach(name => {
                this.loadImage(name, basePath + name, version, (success, img) => {
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

            function onAllDone() {
                for (let name in data.frames) {
                    let obj = data.frames[name];
                    let img = imgs[obj.frame.idx || 0];
                    let sourceRect = { x: obj.frame.x, y: obj.frame.y, width: obj.frame.w, height: obj.frame.h };
                    let textureRect = { x: obj.spriteSourceSize.x, y: obj.spriteSourceSize.y, width: obj.sourceSize.w, height: obj.sourceSize.h };
                    let texture = Texture.create(img, sourceRect, textureRect);
                    Texture.cacheAs(namePrefix + name, texture);
                    altas[name] = texture;
                }
                loadedResources[requestUrl] = altas;
                onComplete(true, altas);
            }
        });
    }

    public static loadImage(name: string, url: string, version: string, onComplete: (loaded: boolean, img: HTMLImageElement) => any) {
        let requestUrl = url + '?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }

        let img = new Image();
        img.onload = () => {
            let texture = Texture.create(img);
            Texture.cacheAs(name, texture);
            Texture.cacheAs(url, texture);
            loadedResources[requestUrl] = img;
            onComplete(true, img);
        };
        img.onerror = () => {
            onComplete(false, img);
        };
        img.src = requestUrl;
    }

    public static loadAudio(url: string, version: string, channel: number, onComplete: (loaded: boolean, res: (WebAudio | HTMLAudio)[]) => any) {
        let requestUrl = url + '?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }

        let basePath = getBasePath(url);
        let filePath = url.slice(basePath.length);
        let ext = filePath.match(/\.[^.]+$/)[0];
        let name = filePath.slice(0, filePath.length - ext.length);
        Sound.ext = ext as any;
        Sound.load(basePath, name, (loaded) => {
            let audioes = Sound.getAllAudioes(name);
            if (loaded) {
                loadedResources[requestUrl] = audioes;
            }
            onComplete(loaded, audioes);
        }, channel);
    }

    public static loadJson(url: string, version: string, onComplete: Function) {
        let requestUrl = url + '?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }

        Request.getJson(requestUrl, (res) => {
            loadedResources[requestUrl] = res;
            onComplete(true, res);
        }, () => {
            console.error(`Error in loading JSON file "${url}" width version "${version}"`);
        });
    }

    public static loadHtmlTemplate(url: string, version: string, onComplete: Function) {
        let requestUrl = url + '.html?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }
        Request.get(requestUrl, (html) => {
            loadedResources[requestUrl] = html;
            TemplateManager.registerHtmlTemplate(url, html);
            onComplete(true, html);
        }, () => {
            console.error(`Error in loading Text file "${url}" width version "${version}"`);
        });
    }

    public static loadJsonTemplate(url: string, version: string, onComplete: Function) {
        let requestUrl = url + '.json?v=' + version;
        if (loadedResources[requestUrl]) {
            return onComplete(true, loadedResources[requestUrl]);
        }
        Request.getJson(requestUrl, (json) => {
            loadedResources[requestUrl] = json;
            TemplateManager.registerJsonTemplate(url, json);
            onComplete(true, json);
        }, () => {
            console.error(`Error in loading Text file "${url}" width version "${version}"`);
        });
    }

    public static getAltas(url: string) {
        return altasMap[url];
    }
}

function getBasePath(url: string) {
    if (!basePathMap[url]) {
        let split = url.indexOf("/") >= 0 ? "/" : "\\";
        let idx = url.lastIndexOf(split);
        basePathMap[url] = idx >= 0 ? url.substr(0, idx + 1) : "";
    }
    return basePathMap[url];
}