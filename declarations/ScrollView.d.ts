import { Sprite, SpriteProps, EventHelper } from 'canvas2djs';
import { TouchScroll } from './TouchScroll';
export declare type ScrollViewProps = SpriteProps & {
    bounce?: boolean;
    horizentalScroll?: boolean;
    verticalScroll?: boolean;
    onScroll?(scrollPosition: Point);
};
export declare type Point = {
    x: number;
    y: number;
};
export declare class ScrollView extends Sprite<ScrollViewProps> {
    static SCROLL: string;
    static scrollThreshold: number;
    onScroll: (scrollPosition: Point) => any;
    horizentalScroll: boolean;
    verticalScroll: boolean;
    bounce: boolean;
    protected scroller: Sprite<{}>;
    protected scrollPos: Point;
    protected size: {
        width: number;
        height: number;
    };
    protected touchScrollHorizental: TouchScroll;
    protected touchScrollVertical: TouchScroll;
    protected beginPosId: number;
    protected beginPos: Point;
    constructor(props?: ScrollViewProps);
    addChild(child: Sprite<{}>, position?: number): void;
    removeChild(child: Sprite<{}>): void;
    removeAllChildren(recusive?: boolean): void;
    getScrollerSize(): {
        width: number;
        height: number;
    };
    protected _onChildResize(): void;
    protected measureViewportSize(): void;
    protected onUpdateHorizentalScroll: (scrollX: number) => void;
    protected onUpdateVerticalScroll: (scrollY: number) => void;
    protected onTouchBeginHandler: (helpers: EventHelper[]) => void;
    protected onTouchMovedHandler: (helpers: EventHelper[]) => void;
    protected onTouchEndedHandler: (e: EventHelper[]) => void;
    release(recusive?: boolean): void;
}
