import { ScrollView, ScrollViewProps } from './ScrollView';
import { Sprite, AlignType } from 'canvas2djs';
export declare type AutoLayoutViewProps = ScrollViewProps & {
    margin?: number;
    layout?: Layout;
    alignChild?: AlignType;
};
export declare enum Layout {
    Vertical = 0,
    Horizontal = 1,
}
export declare class AutoLayoutView extends ScrollView {
    protected _props: AutoLayoutViewProps;
    protected _layout: Layout;
    protected _margin: number;
    protected _alignChild: AlignType;
    constructor(props?: {});
    alignChild: number;
    layout: Layout;
    margin: number;
    addChild(target: Sprite<{}>, position?: number): void;
    removeChild(target: Sprite<{}>): void;
    protected _resizeWidth(): void;
    protected _resizeHeight(): void;
    protected reLayout(): void;
    protected alignChildVirtical(begin: number, end: number, sprites: Sprite<{}>[], x: number, width: number): void;
    protected alignChildHorizental(begin: number, end: number, sprites: Sprite<{}>[], y: number, height: number): void;
}
