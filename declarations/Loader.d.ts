import { Texture, WebAudio, HTMLAudio } from 'canvas2djs';
export declare enum ResourceType {
    Image = 0,
    Altas = 1,
    Json = 2,
    Audio = 3,
    HtmlTemplate = 4,
    JsonTemplate = 5,
}
export declare type Resource = {
    url: string;
    type: ResourceType;
    channel?: number;
};
export declare class Loader {
    private static audioChannel;
    static setAudioChannel(channel: number): void;
    static clear(): void;
    static load(resources: Resource[], version: string, onCompleted: Function, onProgress?: (percent: number) => any, onError?: (type: ResourceType, url: string, version: string) => any): void;
    static loadAltas(url: string, version: string, onComplete: Function, onProgress?: (percent: number) => any, onError?: Function): any;
    static loadImage(name: string, url: string, version: string, onComplete: (loaded: boolean, img: HTMLImageElement) => any): any;
    static loadAudio(url: string, version: string, channel: number, onComplete: (loaded: boolean, res: (WebAudio | HTMLAudio)[]) => any): any;
    static loadJson(url: string, version: string, onComplete: Function): any;
    static loadHtmlTemplate(url: string, version: string, onComplete: Function): any;
    static loadJsonTemplate(url: string, version: string, onComplete: Function): any;
    static getAltas(url: string): {
        [name: string]: Texture;
    };
}
