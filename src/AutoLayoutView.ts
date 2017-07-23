import { ScrollView, ScrollViewProps } from './ScrollView';
import { Sprite, AlignType } from 'canvas2djs';
import { Utility } from './Utility';

export type AutoLayoutViewProps = ScrollViewProps & {
    layout?: Layout;
    alignChild?: AlignType;
    verticalSpacing?: number;
    horizentalSpacing?: number;
}

export enum Layout {
    Vertical,
    Horizontal,
}

export class AutoLayoutView extends ScrollView {

    protected _props: AutoLayoutViewProps;
    protected _layout: Layout;
    protected _alignChild: AlignType;
    protected _verticalSpacing: number;
    protected _horizentalSpacing: number;

    constructor(props = {}) {
        super({
            ...props,
        });
        this._layout = this._layout == null ? Layout.Horizontal : this._layout;
        this._verticalSpacing = this._verticalSpacing || 0;
        this._horizentalSpacing = this._horizentalSpacing || 0;
        this._alignChild = this._alignChild == null ? AlignType.CENTER : this._alignChild;

        this.scroller.addChild = (...args) => {
            Sprite.prototype.addChild.apply(this.scroller, args);
            Utility.nextTick(this.reLayout, this);
        };
        this.scroller.removeChild = (...args) => {
            Sprite.prototype.removeChild.apply(this.scroller, args);
            Utility.nextTick(this.reLayout, this);
        };
    }

    get alignChild() {
        return this._alignChild;
    }

    set alignChild(value: number) {
        if (value !== this._alignChild) {
            this._alignChild = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

    get layout() {
        return this._layout;
    }

    set layout(value: Layout) {
        if (value !== this._layout) {
            this._layout = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

    get verticalSpacing() {
        return this._verticalSpacing;
    }

    set verticalSpacing(value: number) {
        if (value !== this._verticalSpacing) {
            this._verticalSpacing = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

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
        Sprite.prototype.addChild.call(this.scroller, target, position);
        Utility.nextTick(this.reLayout, this);
    }

    public removeChild(target: Sprite<{}>) {
        Sprite.prototype.removeChild.call(this.scroller, target);
        Utility.nextTick(this.reLayout, this);
    }

    // protected _resizeWidth() {
    //     (Sprite.prototype as any)._resizeWidth.call(this);
    //     Utility.nextTick(this.reLayout, this);
    // }

    // protected _resizeHeight() {
    //     (Sprite.prototype as any)._resizeHeight.call(this);
    //     Utility.nextTick(this.reLayout, this);
    // }

    protected _onChildResize() {
        // this.reLayout();
        Utility.nextTick(this.reLayout, this);
        (Sprite.prototype as any)._onChildResize.call(this);
    }

    protected reLayout() {
        if (!this.stage || !this.scroller.children || !this.scroller.children.length) {
            return;
        }

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
            children.forEach((sprite, index) => {
                if (sprite.width === 0) {
                    return;
                }
                let spacing = (prevExist ? horizentalSpacing : 0);
                let right = x + sprite.width + spacing;
                if (right <= width || index === 0) {
                    sprite.x = x + (sprite as any)._originPixelX + spacing;
                    x = right;
                    prevExist = true;
                }
                else {
                    y += count > 0 ? verticalSpacing : 0;
                    this.alignChildHorizental(beginIndex, index - 1, children, y, maxHeight);
                    beginIndex = index;
                    y += maxHeight;
                    x = sprite.width;
                    sprite.x = (sprite as any)._originPixelX;
                    maxHeight = 0;
                    count += 1;
                }
                if (sprite.height > maxHeight) {
                    maxHeight = sprite.height;
                }
            });
            y += count > 0 ? verticalSpacing : 0;
            this.alignChildHorizental(beginIndex, children.length - 1, children, y, maxHeight);
        }
        else if (this.layout === Layout.Vertical) {
            children.forEach((sprite, index) => {
                if (sprite.height === 0) {
                    return;
                }
                let spacing = (prevExist ? verticalSpacing : 0);
                let bottom = y + sprite.height;
                if (bottom <= height || index === 0) {
                    sprite.y = y + (sprite as any)._originPixelY + spacing;
                    y = bottom;
                    prevExist = true;
                }
                else {
                    x += count > 0 ? horizentalSpacing : 0;
                    this.alignChildVirtical(beginIndex, index - 1, children, x, maxWidth);
                    beginIndex = index;
                    x += maxWidth;
                    y = sprite.height;
                    sprite.y = (sprite as any)._originPixelY;
                    maxWidth = 0;
                    count += 1;
                }
                if (sprite.width > maxWidth) {
                    maxWidth = sprite.width;
                }
            });
            x += count > 0 ? horizentalSpacing : 0;
            this.alignChildHorizental(beginIndex, children.length - 1, children, x, maxWidth);
        }
        else {
            Utility.warn(`Unknow layout`, this.layout);
        }

        this.measureViewportSize();
    }

    protected alignChildVirtical(begin: number, end: number, sprites: Sprite<{}>[], x: number, width: number) {
        if (end < begin) {
            return;
        }
        if (this._alignChild === AlignType.LEFT) {
            for (let i = begin; i <= end; i++) {
                let sprite = sprites[i] as any;
                sprite.x = x + sprite._originPixelX;
            }
        }
        else if (this._alignChild === AlignType.RIGHT) {
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
        if (this._alignChild === AlignType.TOP) {
            for (let i = begin; i <= end; i++) {
                let sprite = sprites[i] as any;
                sprite.y = y + sprite._originPixelY;
            }
        }
        else if (this._alignChild === AlignType.BOTTOM) {
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