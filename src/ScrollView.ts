import { Sprite, SpriteProps, UIEvent, EventHelper } from 'canvas2djs';
import { TouchScroll } from './TouchScroll';
import { Utility } from './Utility';
import { BaseComponent, Property } from './ComponentManager';
import "./InternalViews";

export type ScrollViewProps = SpriteProps & {
    bounce?: boolean;
    horizentalScroll?: boolean;
    verticalScroll?: boolean;
    onScroll?(scrollPosition: Point);
};

export type Point = { x: number; y: number; }

@BaseComponent("ScrollView", "sprite")
export class ScrollView extends Sprite<ScrollViewProps> {

    public static SCROLL = "scroll";
    public static scrollThreshold: number = 5;

    public onScroll: (scrollPosition: Point) => any;

    @Property(Boolean)
    public horizentalScroll: boolean;

    @Property(Boolean)
    public verticalScroll: boolean;

    @Property(Boolean)
    public bounce: boolean;

    protected scroller: Sprite<{}>;
    protected scrollPos: Point = { x: 0, y: 0 };
    protected size = { width: 0, height: 0 };
    protected touchScrollHorizental: TouchScroll;
    protected touchScrollVertical: TouchScroll;

    protected beginPosId: number;
    protected beginPos: Point;

    constructor(props: ScrollViewProps = {}) {
        super({
            ...props,
            clipOverflow: true,
        });
        this.scroller = new Sprite({
            originX: 0,
            originY: 0,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        });
        this.scroller.addChild = (...args) => {
            Sprite.prototype.addChild.apply(this.scroller, args);
            Utility.nextTick(this.measureViewportSize, this);
        };
        this.scroller.removeChild = (...args) => {
            Sprite.prototype.removeChild.apply(this.scroller, args);
            Utility.nextTick(this.measureViewportSize, this);
        };

        this.bounce = this.bounce == null ? true : this.bounce;
        super.addChild(this.scroller);
        this.touchScrollHorizental = new TouchScroll(this.onUpdateHorizentalScroll, () => { });
        this.touchScrollVertical = new TouchScroll(this.onUpdateVerticalScroll, () => { });
        this.touchScrollHorizental.bounce = this.touchScrollVertical.bounce = this.bounce;

        this.on(UIEvent.TOUCH_BEGIN, this.onTouchBeginHandler);
    }

    public addChild(child: Sprite<{}>, position?: number) {
        this.scroller.addChild(child, position);
        Utility.nextTick(this.measureViewportSize, this);
    }

    public removeChild(child: Sprite<{}>) {
        this.scroller.removeChild(child);
        Utility.nextTick(this.measureViewportSize, this);
    }

    public removeAllChildren(recusive?: boolean) {
        this.scroller.removeAllChildren(recusive);
    }

    public getScrollerSize() {
        return { ...this.size };
    }

    // protected _resizeWidth() {
    //     super._resizeWidth();
    //     Utility.nextTick(this.measureViewportSize, this);
    // }

    // protected _resizeHeight() {
    //     super._resizeHeight();
    //     Utility.nextTick(this.measureViewportSize, this);
    // }

    protected _onChildResize() {
        // this.measureViewportSize();
        Utility.nextTick(this.measureViewportSize, this);
        super._onChildResize();
    }

    protected measureViewportSize() {
        if (!this.stage) {
            return;
        }
        let width = 0;
        let height = 0;
        if (this.scroller.children) {
            this.scroller.children.forEach(sprite => {
                let right = sprite.x + sprite.width - (sprite as any)._originPixelX;
                let bottom = sprite.y + sprite.height - (sprite as any)._originPixelY;
                if (right > width) {
                    width = right;
                }
                if (bottom > height) {
                    height = bottom;
                }
            });
        }
        if (height < this.size.height && this.verticalScroll) {
            this.onUpdateVerticalScroll(0);
        }
        if (width < this.size.width && this.horizentalScroll) {
            this.onUpdateHorizentalScroll(0);
        }
        this.size = { width, height };
    }

    protected onUpdateHorizentalScroll = (scrollX: number) => {
        this.scroller.x = -scrollX;
        this.scrollPos.x = scrollX;
        this.onScroll && this.onScroll({ ...this.scrollPos });
        this.emit(ScrollView.SCROLL, { ...this.scrollPos });
    }

    protected onUpdateVerticalScroll = (scrollY: number) => {
        this.scroller.y = -scrollY;
        this.scrollPos.y = scrollY;
        this.onScroll && this.onScroll({ ...this.scrollPos });
        this.emit(ScrollView.SCROLL, { ...this.scrollPos });
    }

    protected onTouchBeginHandler = (helpers: EventHelper[]) => {
        if (!this.horizentalScroll && !this.verticalScroll) {
            return;
        }

        let helper = helpers[0];
        this.beginPosId = helper.identifier;
        this.beginPos = { x: helper.stageX, y: helper.stageY };

        if (this.horizentalScroll) {
            this.touchScrollHorizental.start(helper.stageX);
        }
        if (this.verticalScroll) {
            this.touchScrollVertical.start(helper.stageY);
        }

        // helper.stopPropagation();

        this.stage.on(UIEvent.TOUCH_MOVED, this.onTouchMovedHandler);
        this.stage.on(UIEvent.TOUCH_ENDED, this.onTouchEndedHandler);
    }

    protected onTouchMovedHandler = (helpers: EventHelper[]) => {
        if (!this.beginPos) {
            return;
        }

        let touchPoint = helpers.filter(e => e.identifier === this.beginPosId)[0];
        if (!touchPoint) {
            return;
        }

        let beginPos = this.beginPos;
        if (this.horizentalScroll && Math.abs(touchPoint.stageX - beginPos.x) >= ScrollView.scrollThreshold) {
            this.touchScrollHorizental.update(touchPoint.stageX, this.size.width - this.width, this.scrollPos.x);
        }
        if (this.verticalScroll && Math.abs(touchPoint.stageY - beginPos.y) >= ScrollView.scrollThreshold) {
            this.touchScrollVertical.update(touchPoint.stageY, this.size.height - this.height, this.scrollPos.y);
        }

        touchPoint.stopPropagation();
    }

    protected onTouchEndedHandler = (e: EventHelper[]) => {
        this.stage.removeListener(UIEvent.TOUCH_MOVED, this.onTouchMovedHandler);
        this.stage.removeListener(UIEvent.TOUCH_ENDED, this.onTouchEndedHandler);
        if (!this.beginPos) {
            return;
        }
        if (this.horizentalScroll) {
            this.touchScrollHorizental.finish(this.scrollPos.x, this.size.width - this.width);
        }
        if (this.verticalScroll) {
            this.touchScrollVertical.finish(this.scrollPos.y, this.size.height - this.height);
        }
        e[0].stopPropagation();
        this.beginPos = this.beginPosId = null;
    }

    public release(recusive?: boolean) {
        this.touchScrollHorizental.stop();
        this.touchScrollVertical.stop();
        this.scroller.addChild = this.removeChild = null;
        super.removeChild(this.scroller);
        super.release(recusive);
    }
}