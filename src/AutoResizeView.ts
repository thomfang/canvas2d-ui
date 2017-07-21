import { Sprite, SpriteProps, AlignType } from 'canvas2djs';
import { Layout } from './AutoLayoutView';
import { Utility } from './Utility';

export type AutoResizeViewProps = SpriteProps & {
    margin?: number;
    layout?: Layout;
    alignChild?: AlignType;
}

export class AutoResizeView extends Sprite<AutoResizeViewProps> {

    protected _margin: number;
    protected _layout: Layout;
    protected _alignChild: AlignType;

    constructor(props = {}) {
        super({
            ...props
        });
        this._margin = this._margin || 0;
        this._layout = this._layout == null ? Layout.Horizontal : this._layout;
        this._alignChild = this._alignChild == null ? AlignType.CENTER : this._alignChild;
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

    get layout() {
        return this._layout;
    }

    set layout(value: Layout) {
        if (value !== this._layout) {
            this._layout = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

    get alignChild() {
        return this._alignChild;
    }

    set alignChild(value: AlignType) {
        if (value !== this._alignChild) {
            this._alignChild = value;
            Utility.nextTick(this.reLayout, this);
        }
    }

    public addChild(target: Sprite<{}>, position?: number) {
        super.addChild(target, position);
        // Utility.nextTick(this.reLayout, this);
        this.reLayout();
    }

    public removeChild(target: Sprite<{}>) {
        super.removeChild(target);
        Utility.nextTick(this.reLayout, this);
    }

    private reLayout() {
        if (!this.children || !this.children.length) {
            this.width = 0;
            this.height = 0;
            return;
        }

        const { layout, margin, alignChild, children } = this;
        let height = 0;
        let width = 0;

        if (layout === Layout.Horizontal) {
            children.forEach((sprite, index) => {
                if (sprite.width === 0 || !sprite.visible) {
                    return;
                }
                if (sprite.height > height) {
                    height = sprite.height;
                }
                sprite.x = width + margin + (<any>sprite)._originPixelX;
                width += sprite.width + margin;
            });

            if (width != 0) {
                this.width = width + margin;
            }
            if (height != 0) {
                height += margin * 2;
                this.height = height;
                if (alignChild === AlignType.TOP) {
                    this.children.forEach(sprite => {
                        sprite.y = margin + (<any>sprite)._originPixelY;
                    });
                }
                else if (alignChild === AlignType.BOTTOM) {
                    this.children.forEach(sprite => {
                        sprite.y = height - margin - sprite.height + (<any>sprite)._originPixelY;
                    });
                }
                else {
                    this.children.forEach(sprite => {
                        sprite.y = (height - sprite.height) * 0.5 + (<any>sprite)._originPixelY;
                    });
                }
            }
        }
        else if (layout === Layout.Vertical) {
            children.forEach((sprite, index) => {
                if (sprite.height === 0 || !sprite.visible) {
                    return;
                }
                if (sprite.width > width) {
                    width = sprite.width;
                }
                sprite.y = height + margin + (<any>sprite)._originPixelY;
                height += sprite.height + margin;
            });

            if (height != 0) {
                this.height = height + margin;
            }
            if (width != 0) {
                width += margin * 2;
                this.width = width;
                if (alignChild === AlignType.LEFT) {
                    this.children.forEach(sprite => {
                        sprite.x = margin + (<any>sprite)._originPixelX;
                    });
                }
                else if (alignChild === AlignType.RIGHT) {
                    this.children.forEach(sprite => {
                        sprite.x = width - margin - sprite.width + (<any>sprite)._originPixelX;
                    });
                }
                else {
                    this.children.forEach(sprite => {
                        sprite.x = (width - sprite.width) * 0.5 + (<any>sprite)._originPixelX;
                    });
                }
            }
        }
    }
}