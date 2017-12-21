import { Sprite, SpriteProps, UIEvent, EventHelper } from 'canvas2djs';
import { TouchScroll } from './TouchScroll';
import { BaseComponent, Property } from './ComponentManager';
import "./InternalViews";
import { Utility } from './Utility';

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
    protected scrollPos: Point;
    protected size: { width: number, height: number };
    protected touchScrollHorizental: TouchScroll;
    protected touchScrollVertical: TouchScroll;

    protected beginPosId: number;
    protected beginPos: Point;

    constructor(props: ScrollViewProps = {}) {
        super({
            ...props,
            clipOverflow: true,
        });
        this.size = { width: 0, height: 0 };
        this.scrollPos = { x: 0, y: 0 };
        this.scroller = new Sprite({
            originX: 0,
            originY: 0,
            percentWidth: 1,
            percentHeight: 1,
        });
        this.scroller.addChild = function (target: Sprite<{}>, position?: number) {
            if (!this.children || this.children.length <= 1) {
                this.visible = false;
            }
            Sprite.prototype.addChild.call(this, target, position);
            // this.parent && this.parent.updateView();
            if (this.parent) {
                Utility.nextTick(this.parent.updateView, this.parent);
            }
        };
        this.scroller.removeChild = function (target: Sprite<{}>) {
            Sprite.prototype.removeChild.call(this, target);
            // this.parent && this.parent.updateView();
            if (this.parent) {
                Utility.nextTick(this.parent.updateView, this.parent);
            }
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
        // this.updateView();
    }

    public removeChild(child: Sprite<{}>) {
        this.scroller.removeChild(child);
        // this.updateView();
    }

    public removeAllChildren(recusive?: boolean) {
        this.scroller.removeAllChildren(recusive);
    }

    public getScrollerSize() {
        return { ...this.size };
    }

    protected _onChildResize() {
        Utility.nextTick(this.notifyResizeParent, this);
    }

    protected notifyResizeParent() {
        this.updateView();
        if (this.parent) {
            this.parent['_onChildResize']();
        }
    }

    protected updateView() {
        if (!this.scroller) {
            return;
        }
        let width = 0;
        let height = 0;
        let children = this.scroller.children;
        if (children) {
            for (let i = 0, sprite: Sprite<{}>; sprite = children[i]; i++) {
                let left = sprite.x - (sprite as any)._originPixelX;
                let top = sprite.y - (sprite as any)._originPixelY;
                let right = left + sprite.width;
                let bottom = top + sprite.height;
                if (right > width) {
                    width = right;
                }
                if (bottom > height) {
                    height = bottom;
                }
            }
        }
        if (height - this.height < this.scrollPos.y && this.verticalScroll) {
            Utility.nextTick(this.fixScrollPosition, this);
        }
        if (width - this.width < this.scrollPos.x && this.horizentalScroll) {
            Utility.nextTick(this.fixScrollPosition, this);
        }
        this.size.width = width;
        this.size.height = height;
        this.scroller.visible = true;
        this.updateItemVisible();
    }

    protected fixScrollPosition() {
        if (!this.size || !this.touchScrollHorizental || !this.touchScrollVertical) {
            return;
        }
        if (this.size.height - this.height < this.scrollPos.y && this.verticalScroll) {
            this.touchScrollVertical.stop();
            this.onUpdateVerticalScroll(Math.max(0, this.size.height - this.height));
        }
        if (this.size.width - this.width < this.scrollPos.x && this.horizentalScroll) {
            this.touchScrollHorizental.stop();
            this.onUpdateHorizentalScroll(Math.max(0, this.size.width - this.width));
        }
    }

    protected onUpdateHorizentalScroll = (scrollX: number) => {
        this.scroller.x = -scrollX;
        this.scrollPos.x = scrollX;
        this.updateItemVisible();
        let pos = {
            x: this.scrollPos.x,
            y: this.scrollPos.y,
        }
        this.onScroll && this.onScroll(pos);
        this.emit(ScrollView.SCROLL, pos);
    }

    protected updateItemVisible() {
        let children = this.scroller.children;
        let x = this.scroller.x;
        let y = this.scroller.y;
        let viewportWidth = this.width;
        let viewportHeight = this.height;
        if (children) {
            for (let i = 0, sprite: Sprite<{}>; sprite = children[i]; i++) {
                let left = x + sprite.x - (sprite as any)._originPixelX;
                let top = y + sprite.y - (sprite as any)._originPixelY;
                let right = left + sprite.width;
                let bottom = top + sprite.height;
                if (left >= viewportWidth || right <= 0 || top >= viewportHeight || bottom <= 0) {
                    sprite.visible = false;
                }
                else {
                    sprite.visible = true;
                }
            }
        }
    }

    protected onUpdateVerticalScroll = (scrollY: number) => {
        this.scroller.y = -scrollY;
        this.scrollPos.y = scrollY;
        this.updateItemVisible();
        let pos = {
            x: this.scrollPos.x,
            y: this.scrollPos.y,
        }
        this.onScroll && this.onScroll(pos);
        this.emit(ScrollView.SCROLL, pos);
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

        if (this.stage) {
            this.stage.on(UIEvent.TOUCH_MOVED, this.onTouchMovedHandler);
            this.stage.on(UIEvent.TOUCH_ENDED, this.onTouchEndedHandler);
        }
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

    protected onTouchEndedHandler = (helpers: EventHelper[]) => {
        if (this.stage) {
            this.stage.removeListener(UIEvent.TOUCH_MOVED, this.onTouchMovedHandler);
            this.stage.removeListener(UIEvent.TOUCH_ENDED, this.onTouchEndedHandler);
        }
        if (this.horizentalScroll) {
            this.touchScrollHorizental.finish(this.scrollPos.x, this.size.width - this.width);
        }
        if (this.verticalScroll) {
            this.touchScrollVertical.finish(this.scrollPos.y, this.size.height - this.height);
        }
        if (this.beginPos) {
            let touchPoint = helpers.filter(e => e.identifier === this.beginPosId)[0];
            touchPoint && touchPoint.stopPropagation();
        }
        this.beginPos = this.beginPosId = null;
    }

    public release(recusive?: boolean) {
        if (this.stage) {
            this.stage.removeListener(UIEvent.TOUCH_MOVED, this.onTouchMovedHandler);
            this.stage.removeListener(UIEvent.TOUCH_ENDED, this.onTouchEndedHandler);
        }
        this.touchScrollHorizental.release();
        this.touchScrollVertical.release();
        this.touchScrollHorizental = this.touchScrollVertical = null;
        this.scroller.removeChild = this.removeChild = Sprite.prototype.removeChild;
        this.removeAllChildren = Sprite.prototype.removeAllChildren;
        // super.removeChild(this.scroller);
        this.scroller.release(true);
        this.scroller = null;
        super.release(recusive);
    }
}