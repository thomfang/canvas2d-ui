import { ScrollView, ScrollViewProps } from './ScrollView';
import { Sprite, AlignType } from 'canvas2djs';
import { Utility } from './Utility';

export type AutoLayoutViewProps = ScrollViewProps & {
    margin?: number;
    layout?: Layout;
    alignChild?: AlignType;
}

export enum Layout {
    Vertical,
    Horizontal,
}

export class AutoLayoutView extends ScrollView {

    protected _props: AutoLayoutViewProps;
    protected _layout: Layout;
    protected _margin: number;
    protected _alignChild: AlignType;

    constructor(props = {}) {
        super({
            ...props,
        });
        this._margin = this._margin || 0;
        this._layout = this._layout == null ? Layout.Horizontal : this._layout;
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

    get margin() {
        return this._margin;
    }

    set margin(value: number) {
        if (value !== this._margin) {
            this._margin = value;
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

    protected _resizeWidth() {
        (Sprite.prototype as any)._resizeWidth.call(this);
        Utility.nextTick(this.reLayout, this);
    }

    protected _resizeHeight() {
        (Sprite.prototype as any)._resizeHeight.call(this);
        Utility.nextTick(this.reLayout, this);
    }

    protected reLayout() {
        if (!this.stage || !this.scroller.children || !this.scroller.children.length) {
            return;
        }

        let children = this.scroller.children;
        let margin = this.margin;
        let width = this.width;
        let height = this.height;
        let maxHeight = 0;
        let maxWidth = 0;
        let x = margin;
        let y = margin;
        let beginIndex = 0;

        if (this.layout === Layout.Horizontal) {
            children.forEach((sprite, index) => {
                if (sprite.width === 0) {
                    return;
                }
                let right = x + sprite.width;
                if (right <= width || index === 0) {
                    sprite.x = x + (sprite as any)._originPixelX;
                    // sprite.y = y + (sprite as any)._originPixelY;
                    x = right + margin;
                }
                else {
                    this.alignChildHorizental(beginIndex, index - 1, children, y, maxHeight);
                    beginIndex = index;
                    y += maxHeight + margin;
                    x = margin * 2 + sprite.width;
                    sprite.x = margin + (sprite as any)._originPixelX;
                    // sprite.y = y + (sprite as any)._originPixelY;
                    maxHeight = 0;
                }
                if (sprite.height > maxHeight) {
                    maxHeight = sprite.height;
                }
            });
            this.alignChildHorizental(beginIndex, children.length - 1, children, y, maxHeight);
        }
        else if (this.layout === Layout.Vertical) {
            children.forEach((sprite, index) => {
                if (sprite.height === 0) {
                    return;
                }
                let bottom = y + sprite.height;
                if (bottom <= height || index === 0) {
                    sprite.y = y + (sprite as any)._originPixelY;
                    // sprite.x = x + (sprite as any)._originPixelX;
                    y = bottom + margin;
                }
                else {
                    this.alignChildVirtical(beginIndex, index - 1, children, x, maxWidth);
                    beginIndex = index;
                    x += maxWidth + margin;
                    y = margin * 2 + sprite.height;
                    sprite.y = margin + (sprite as any)._originPixelY;
                    // sprite.x = x + (sprite as any)._originPixelX;
                    maxWidth = 0;
                }
                if (sprite.width > maxWidth) {
                    maxWidth = sprite.width;
                }
            });
            this.alignChildHorizental(beginIndex, children.length - 1, children, x, maxWidth);
        }
        else {
            Utility.warn(`Unknow layout`, this.layout);
        }

        this.measureViewportSize();

        if (margin !== 0) {
            if (this.layout === Layout.Horizontal && this.size.height !== 0) {
                this.size.height += margin;
            }
            else if (this.layout === Layout.Vertical && this.size.width !== 0) {
                this.size.width += margin;
            }
        }
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