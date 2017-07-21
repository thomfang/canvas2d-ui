import { Sprite, SpriteProps, AlignType } from 'canvas2djs';
import { Layout } from './AutoLayoutView';
export declare type AutoResizeViewProps = SpriteProps & {
    margin?: number;
    layout?: Layout;
    alignChild?: AlignType;
};
export declare class AutoResizeView extends Sprite<AutoResizeViewProps> {
    protected _margin: number;
    protected _layout: Layout;
    protected _alignChild: AlignType;
    constructor(props?: {});
    margin: number;
    layout: Layout;
    alignChild: AlignType;
    addChild(target: Sprite<{}>, position?: number): void;
    removeChild(target: Sprite<{}>): void;
    private reLayout();
}
