import { ScrollView, ScrollViewProps } from './ScrollView';
import { Sprite, AlignType } from 'canvas2djs';
import "./InternalViews";
export declare type AutoLayoutViewProps = ScrollViewProps & {
    layout?: Layout;
    verticalSpacing?: number;
    horizentalSpacing?: number;
    autoSize?: boolean;
    horizentalAlign?: HorizentalAlign;
    verticalAlign?: VerticalAlign;
};
export declare enum Layout {
    Vertical = 0,
    Horizontal = 1,
}
export declare type HorizentalAlign = AlignType.LEFT | AlignType.CENTER | AlignType.RIGHT;
export declare type VerticalAlign = AlignType.TOP | AlignType.CENTER | AlignType.BOTTOM;
export declare class AutoLayoutView extends ScrollView {
    protected _props: AutoLayoutViewProps;
    protected _layout: Layout;
    protected _verticalSpacing: number;
    protected _horizentalSpacing: number;
    protected _autoSize: boolean;
    protected _horizentalAlign: HorizentalAlign;
    protected _verticalAlign: VerticalAlign;
    constructor(props?: {});
    horizentalAlign: HorizentalAlign;
    verticalAlign: VerticalAlign;
    layout: Layout;
    autoSize: boolean;
    verticalSpacing: number;
    horizentalSpacing: number;
    addChild(target: Sprite<{}>, position?: number): void;
    removeChild(target: Sprite<{}>): void;
    protected updateView(): void;
    protected applyHorizentalAlign(sprites: Sprite<{}>[], totalWidth: number): void;
    protected applayVerticalAlign(sprites: Sprite<{}>[], totalHeight: number): void;
    protected alignChildVirtical(begin: number, end: number, sprites: Sprite<{}>[], x: number, width: number): void;
    protected alignChildHorizental(begin: number, end: number, sprites: Sprite<{}>[], y: number, height: number): void;
}
