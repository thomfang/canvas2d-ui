import { Utility } from './Utility';
import { SpriteProps, ActionQueue, ActionRepeatMode } from 'canvas2djs';

export class StyleManager {

    private static registeredStyle: { [name: string]: any } = {};

    public static registerStyle<T>(name: string, styleProps: T) {
        if (this.registeredStyle[name] != null) {
            Utility.warn(`Style "${name}" is overried`);
        }
        this.registeredStyle[name] = styleProps;
    }

    public static registerStyleMap(prefix: string, styleMap: object) {
        Object.keys(styleMap).forEach(name => {
            this.registerStyle(`${prefix}-${name}`, styleMap[name]);
        });
    }

    public static getStyleByName<T>(name: string): T {
        return this.registeredStyle[name];
    }

    public static getAllRegisterStyles() {
        return { ...this.registeredStyle };
    }
}

export type ActionStyle = {
    startProps?: SpriteProps;
    repeatMode?: ActionRepeatMode;
    queue: ActionQueue;
}