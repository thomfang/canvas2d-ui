import { ScrollView, ScrollViewProps } from './ScrollView';
import { Sprite, AlignType } from 'canvas2djs';
import { Utility } from './Utility';
import { BaseComponent, Property } from './ComponentManager';
import "./InternalViews";

export type AutoLayoutViewProps = ScrollViewProps & {
    layout?: Layout;
    verticalSpacing?: number;
    horizentalSpacing?: number;
    autoResizeHeight?: boolean;
}

export enum Layout {
    Vertical,
    Horizontal,
}

export type HorizentalAlign = AlignType.LEFT | AlignType.CENTER | AlignType.RIGHT;
export type VerticalAlign = AlignType.TOP | AlignType.CENTER | AlignType.BOTTOM

@BaseComponent("AutoLayoutView", "ScrollView")
export class AutoLayoutView extends ScrollView {

    protected _props: AutoLayoutViewProps;
    protected _isPending: any;
    protected _layout: Layout;
    protected _verticalSpacing: number;
    protected _horizentalSpacing: number;
    protected _autoResizeHeight: boolean;
    protected _horizentalAlign: HorizentalAlign;
    protected _verticalAlign: VerticalAlign;

    constructor(props = {}) {
        super({
            ...props,
        });
        this._layout = this._layout == null ? Layout.Horizontal : this._layout;
        this._horizentalAlign = this._horizentalAlign == null ? AlignType.CENTER : this._horizentalAlign;
        this._verticalAlign = this._verticalAlign == null ? AlignType.CENTER : this._verticalAlign;
        this._autoResizeHeight = this._autoResizeHeight == null ? false : this._autoResizeHeight;
        this._verticalSpacing = this._verticalSpacing || 0;
        this._horizentalSpacing = this._horizentalSpacing || 0;

        this.scroller.addChild = (target: Sprite<{}>, position?: number) => {
            target.left = -99999;
            Sprite.prototype.addChild.call(this.scroller, target, position);
            Utility.nextTick(this.reLayout, this);
        };
        this.scroller.removeChild = (target: Sprite<{}>) => {
            Sprite.prototype.removeChild.call(this.scroller, target);
            Utility.nextTick(this.reLayout, this);
        };
    }

    @Property(Number)
    get horizentalAlign() {
        return this._horizentalAlign;
    }

    set horizentalAlign(value: HorizentalAlign) {
        if (value !== this._horizentalAlign) {
            this._horizentalAlign = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

    @Property(Number)
    get verticalAlign() {
        return this._verticalAlign;
    }

    set verticalAlign(value: VerticalAlign) {
        if (value !== this._verticalAlign) {
            this._verticalAlign = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

    @Property(Number)
    get layout() {
        return this._layout;
    }

    set layout(value: Layout) {
        if (value !== this._layout) {
            this._layout = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

    @Property(Boolean)
    get autoResizeHeight() {
        return this._autoResizeHeight;
    }

    set autoResizeHeight(value: boolean) {
        if (this._autoResizeHeight !== value) {
            this._autoResizeHeight = value;
            if (value) {
                this.height = this.size.height;
            }
        }
    }

    @Property(Number)
    get verticalSpacing() {
        return this._verticalSpacing;
    }

    set verticalSpacing(value: number) {
        if (value !== this._verticalSpacing) {
            this._verticalSpacing = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

    @Property(Number)
    get horizentalSpacing() {
        return this._horizentalSpacing;
    }

    set horizentalSpacing(value: number) {
        if (value !== this._horizentalSpacing) {
            this._horizentalSpacing = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

    public addChild(target: Sprite<{}>, position?: number) {
        target.left = -99999;
        Sprite.prototype.addChild.call(this.scroller, target, position);
        Utility.nextTick(this.reLayout, this);
    }

    public removeChild(target: Sprite<{}>) {
        Sprite.prototype.removeChild.call(this.scroller, target);
        Utility.nextTick(this.reLayout, this);
    }

    protected _onChildResize() {
        if (this._isPending) {
            super._onChildResize();
        }
        else {
            Utility.nextTick(this.reLayout, this);
        }
    }

    protected reLayout() {
        if (this._isPending || !this.stage) {
            return;
        }
        if (!this.scroller.children || !this.scroller.children.length) {
            this.size = { width: 0, height: 0 };
            if (this._autoResizeHeight) {
                this.height = 0;
            }
            if (this.verticalScroll) {
                this.touchScrollVertical.stop();
            }
            if (this.horizentalScroll) {
                this.touchScrollVertical.stop();
            }
            return;
        }
        this._isPending = true;

        let children = this.scroller.children;
        let { width, height, verticalSpacing, horizentalSpacing } = this;
        let maxHeight = 0;
        let maxWidth = 0;
        let x = 0;
        let y = 0;
        let beginIndex = 0;
        let count = 0;
        let prevExist: boolean;

        if (this.layout === Layout.Horizontal) {
            let list: Sprite<{}>[] = [];
            children.forEach((sprite, index) => {
                sprite.left = null;
                if (sprite.width === 0) {
                    return;
                }
                let spacing = (prevExist ? horizentalSpacing : 0);
                let right = x + sprite.width + spacing;
                if (right <= width || index === 0) {
                    // sprite.x = x + (sprite as any)._originPixelX + spacing;
                    list.push(sprite);
                    x = right;
                    prevExist = true;
                }
                else {
                    this.applyHorizentalAlign(list, x);
                    y += count > 0 ? verticalSpacing : 0;
                    this.alignChildHorizental(beginIndex, index - 1, children, y, maxHeight);
                    beginIndex = index;
                    y += maxHeight;
                    x = sprite.width;
                    // sprite.x = (sprite as any)._originPixelX;
                    list = [sprite];
                    maxHeight = 0;
                    count += 1;
                }
                if (sprite.height > maxHeight) {
                    maxHeight = sprite.height;
                }
            });

            this.applyHorizentalAlign(list, x);
            y += count > 0 ? verticalSpacing : 0;
            this.alignChildHorizental(beginIndex, children.length - 1, children, y, maxHeight);
        }
        else if (this.layout === Layout.Vertical) {
            let list: Sprite<{}>[] = [];
            children.forEach((sprite, index) => {
                if (sprite.height === 0) {
                    return;
                }
                let spacing = (prevExist ? verticalSpacing : 0);
                let bottom = y + sprite.height;
                if (bottom <= height || index === 0) {
                    // sprite.y = y + (sprite as any)._originPixelY + spacing;
                    list.push(sprite);
                    y = bottom;
                    prevExist = true;
                }
                else {
                    this.applayVerticalAlign(list, y);
                    x += count > 0 ? horizentalSpacing : 0;
                    this.alignChildVirtical(beginIndex, index - 1, children, x, maxWidth);
                    beginIndex = index;
                    x += maxWidth;
                    y = sprite.height;
                    // sprite.y = (sprite as any)._originPixelY;
                    list = [sprite];
                    maxWidth = 0;
                    count += 1;
                }
                if (sprite.width > maxWidth) {
                    maxWidth = sprite.width;
                }
            });

            this.applayVerticalAlign(list, y);
            x += count > 0 ? horizentalSpacing : 0;
            this.alignChildHorizental(beginIndex, children.length - 1, children, x, maxWidth);
        }
        else {
            Utility.warn(`Unknow layout`, this.layout);
        }

        this.measureViewportSize();
        if (this._autoResizeHeight) {
            this.height = this.size.height;
        }

        this._isPending = false;
    }

    protected applyHorizentalAlign(sprites: Sprite<{}>[], totalWidth: number) {
        let horizentalSpacing = this._horizentalSpacing;
        let startX = 0;
        if (this._horizentalAlign === AlignType.CENTER) {
            startX = (this.width - totalWidth) * 0.5;
        }
        else if (this._horizentalAlign === AlignType.RIGHT) {
            startX = this.width - totalWidth;
        }
        sprites.forEach((sprite, i) => {
            let spacing = (i > 0 ? horizentalSpacing : 0);
            sprite.x = startX + (<any>sprite)._originPixelX + spacing;
            startX += sprite.width + spacing;
        });
    }

    protected applayVerticalAlign(sprites: Sprite<{}>[], totalHeight: number) {
        let verticalSpacing = this._verticalSpacing;
        let startY = 0;
        if (this._verticalAlign === AlignType.CENTER) {
            startY = (this.height - totalHeight) * 0.5;
        }
        else if (this._verticalAlign === AlignType.BOTTOM) {
            startY = this.height - totalHeight;
        }
        sprites.forEach((sprite, i) => {
            let spacing = (i > 0 ? verticalSpacing : 0);
            sprite.y = startY + (<any>sprite)._originPixelY + spacing;
            startY += sprite.height + spacing;
        });
    }

    protected alignChildVirtical(begin: number, end: number, sprites: Sprite<{}>[], x: number, width: number) {
        if (end < begin) {
            return;
        }
        let align = this._horizentalAlign;
        if (align === AlignType.LEFT) {
            for (let i = begin; i <= end; i++) {
                let sprite = sprites[i] as any;
                sprite.x = x + sprite._originPixelX;
            }
        }
        else if (align === AlignType.RIGHT) {
            for (let i = begin; i <= end; i++) {
                let sprite = sprites[i] as any;
                sprite.x = x + width - sprite.width + sprite._originPixelX;
            }
        }
        else {
            for (let i = begin; i <= end; i++) {
                let sprite = sprites[i] as any;
                sprite.x = x + (width - sprite.width) * 0.5 + sprite._originPixelX;
            }
        }
    }

    protected alignChildHorizental(begin: number, end: number, sprites: Sprite<{}>[], y: number, height: number) {
        if (end < begin) {
            return;
        }
        let align = this._verticalAlign;
        if (align === AlignType.TOP) {
            for (let i = begin; i <= end; i++) {
                let sprite = sprites[i] as any;
                sprite.y = y + sprite._originPixelY;
            }
        }
        else if (align === AlignType.BOTTOM) {
            for (let i = begin; i <= end; i++) {
                let sprite = sprites[i] as any;
                sprite.y = y + height - sprite.height + sprite._originPixelY;
            }
        }
        else {
            for (let i = begin; i <= end; i++) {
                let sprite = sprites[i] as any;
                sprite.y = y + (height - sprite.height) * 0.5 + sprite._originPixelY;
            }
        }
    }
}