import { ScrollView, ScrollViewProps } from './ScrollView';
import { Sprite, AlignType } from 'canvas2djs';
export declare type AutoLayoutViewProps = ScrollViewProps & {
    layout?: Layout;
    alignChild?: AlignType;
    verticalSpacing?: number;
    horizentalSpacing?: number;
};
export declare enum Layout {
    Vertical = 0,
    Horizontal = 1,
}
export declare class AutoLayoutView extends ScrollView {
    protected _props: AutoLayoutViewProps;
    protected _layout: Layout;
    protected _alignChild: AlignType;
    protected _verticalSpacing: number;
    protected _horizentalSpacing: number;
    constructor(props?: {});
    alignChild: number;
    layout: Layout;
    verticalSpacing: number;
    horizentalSpacing: number;
    addChild(target: Sprite<{}>, position?: number): void;
    removeChild(target: Sprite<{}>): void;
    protected _onChildResize(): void;
    protected reLayout(): void;
    protected alignChildVirtical(begin: number, end: number, sprites: Sprite<{}>[], x: number, width: number): void;
    protected alignChildHorizental(begin: number, end: number, sprites: Sprite<{}>[], y: number, height: number): void;
}
