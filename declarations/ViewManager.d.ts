import { Sprite } from 'canvas2djs';
export declare class ViewManager {
    static createView(node: VirtualNode): VirtualView;
    static createSprite(node: VirtualNode, sprite: Sprite<{}>): VirtualView;
    static createTextLabel(node: VirtualNode): VirtualView;
    static createComponent(node: VirtualNode): VirtualView;
    static setAttribute(object: any, attrName: string, attrValue: any): any;
}
export declare type VirtualNode = {
    type: "text" | "element";
    text?: string;
    tag?: string;
    attr?: {
        [name: string]: string;
    };
    child?: VirtualNode[];
};
export declare type VirtualView = {
    instance: any;
    sprite?: Sprite<{}>;
    child?: VirtualView[];
    nestChild?: VirtualView[];
    directives?: {
        [name: string]: string;
    };
    isComponent?: boolean;
    node?: VirtualNode;
};
