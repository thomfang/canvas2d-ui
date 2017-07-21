import { SpriteProps, ActionQueue, ActionRepeatMode } from 'canvas2djs';
export declare class StyleManager {
    private static registeredStyle;
    static registerStyle<T>(name: string, styleProps: T): void;
    static registerStyleMap(namespace: string, styleMap: {
        [name: string]: any;
    }): void;
    static getStyleByName<T>(name: string): T;
    static getAllRegisterStyles(): {
        [name: string]: any;
    };
}
export declare type ActionStyle = {
    startProps?: SpriteProps;
    repeatMode?: ActionRepeatMode;
    queue: ActionQueue;
};
