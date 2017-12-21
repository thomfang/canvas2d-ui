import { Sprite, SpriteProps, AlignType, Action, ReleasePool } from 'canvas2djs';
import { Layout } from './AutoLayoutView';
import { BaseComponent, Property } from './ComponentManager';
import "./InternalViews";

export type AutoResizeViewProps = SpriteProps & {
    layout?: Layout;
    alignChild?: AlignType;
    marginLeft?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    verticalSpacing?: number;
    horizentalSpacing?: number;
}

@BaseComponent("AutoResizeView", "sprite")
export class AutoResizeView extends Sprite<AutoResizeViewProps> {

    protected _layout: Layout;
    protected _alignChild: AlignType;
    protected _marginLeft: number;
    protected _marginTop: number;
    protected _marginRight: number;
    protected _marginBottom: number;
    protected _verticalSpacing: number;
    protected _horizentalSpacing: number;

    constructor(props = {}) {
        super({
            ...props
        });
        this._marginTop = this._marginTop || 0;
        this._marginRight = this._marginRight || 0;
        this._marginBottom = this._marginBottom || 0;
        this._marginLeft = this._marginLeft || 0;
        this._verticalSpacing = this._verticalSpacing || 0;
        this._horizentalSpacing = this._horizentalSpacing || 0;
        this._layout = this._layout == null ? Layout.Horizontal : this._layout;
        this._alignChild = this._alignChild == null ? AlignType.CENTER : this._alignChild;
    }

    @Property(Number)
    get marginLeft() {
        return this._marginLeft;
    }

    set marginLeft(value: number) {
        if (value !== this._marginLeft) {
            this._marginLeft = value;
            this.updateView();
        }
    }

    @Property(Number)
    get marginRight() {
        return this._marginRight;
    }

    set marginRight(value: number) {
        if (value !== this._marginRight) {
            this._marginRight = value;
            this.updateView();
        }
    }

    @Property(Number)
    get marginBottom() {
        return this._marginBottom;
    }

    set marginBottom(value: number) {
        if (value !== this._marginBottom) {
            this._marginBottom = value;
            this.updateView();
        }
    }

    @Property(Number)
    get marginTop() {
        return this._marginTop;
    }

    set marginTop(value: number) {
        if (value !== this._marginTop) {
            this._marginTop = value;
            this.updateView();
        }
    }

    @Property(Number)
    get verticalSpacing() {
        return this._verticalSpacing;
    }

    set verticalSpacing(value: number) {
        if (value !== this._verticalSpacing) {
            this._verticalSpacing = value;
            this.updateView();
        }
    }

    @Property(Number)
    get horizentalSpacing() {
        return this._horizentalSpacing;
    }

    set horizentalSpacing(value: number) {
        if (value !== this._horizentalSpacing) {
            this._horizentalSpacing = value;
            this.updateView();
        }
    }

    @Property(Number)
    get layout() {
        return this._layout;
    }

    set layout(value: Layout) {
        if (value !== this._layout) {
            this._layout = value;
            this.updateView();
        }
    }

    @Property(Number)
    get alignChild() {
        return this._alignChild;
    }

    set alignChild(value: AlignType) {
        if (value !== this._alignChild) {
            this._alignChild = value;
            this.updateView();
        }
    }

    public addChild(target: Sprite<{}>, position?: number) {
        super.addChild(target, position);
        this.updateView();
    }

    public removeChild(target: Sprite<{}>) {
        super.removeChild(target);
        this.updateView();
    }

    protected _onChildResize() {
        this.updateView();
        super._onChildResize();
    }

    protected updateView() {
        if (!this.children || !this.children.length) {
            this.width = 0;
            this.height = 0;
            return;
        }

        const { layout, alignChild, children, marginLeft, marginRight, marginBottom, marginTop, verticalSpacing, horizentalSpacing } = this;
        let height: number;
        let width: number;
        let count = 0;

        if (layout === Layout.Horizontal) {
            width = marginLeft;
            height = 0;
            for (let index = 0, sprite: Sprite<{}>; sprite = children[index]; index++) {
                if (sprite.width === 0 || !sprite.visible) {
                    continue;
                }
                if (sprite.height > height) {
                    height = sprite.height;
                }
                let spacing = count > 0 ? horizentalSpacing : 0;
                sprite.x = width + (<any>sprite)._originPixelX + spacing;
                width += sprite.width + spacing;
                count += 1;
            }

            if (width > marginLeft) {
                this.width = width + marginRight;
            }
            else {
                this.width = 0;
            }
            if (height != 0) {
                if (alignChild === AlignType.TOP) {
                    for (let i = 0, sprite: Sprite<{}>; sprite = this.children[i]; i++) {
                        sprite.y = marginTop + (<any>sprite)._originPixelY;
                    }
                }
                else if (alignChild === AlignType.BOTTOM) {
                    for (let i = 0, sprite: Sprite<{}>; sprite = this.children[i]; i++) {
                        sprite.y = marginTop + height - sprite.height + (<any>sprite)._originPixelY;
                    }
                }
                else {
                    for (let i = 0, sprite: Sprite<{}>; sprite = this.children[i]; i++) {
                        sprite.y = marginTop + (height - sprite.height) * 0.5 + (<any>sprite)._originPixelY;
                    }
                }
                height += marginTop + marginBottom;
                this.height = height;
            }
            else {
                this.height = 0;
            }
        }
        else if (layout === Layout.Vertical) {
            width = 0;
            height = marginTop;
            for (let index = 0, sprite: Sprite<{}>; sprite = children[index]; index++) {
                if (sprite.height === 0 || !sprite.visible) {
                    continue;
                }
                if (sprite.width > width) {
                    width = sprite.width;
                }
                let spacing = count > 0 ? verticalSpacing : 0;
                sprite.y = height + (<any>sprite)._originPixelY + spacing;
                height += sprite.height + spacing;
                count += 1;
            }

            if (height > marginTop) {
                this.height = height + marginBottom;
            }
            else {
                this.height = 0;
            }
            if (width != 0) {
                if (alignChild === AlignType.LEFT) {
                    for (let i = 0, sprite: Sprite<{}>; sprite = this.children[i]; i++) {
                        sprite.x = marginLeft + (<any>sprite)._originPixelX;
                    }
                }
                else if (alignChild === AlignType.RIGHT) {
                    for (let i = 0, sprite: Sprite<{}>; sprite = this.children[i]; i++) {
                        sprite.x = marginLeft + width - sprite.width + (<any>sprite)._originPixelX;
                    }
                }
                else {
                    for (let i = 0, sprite: Sprite<{}>; sprite = this.children[i]; i++) {
                        sprite.x = marginLeft + (width - sprite.width) * 0.5 + (<any>sprite)._originPixelX;
                    }
                }
                width += marginLeft + marginRight;
                this.width = width;
            }
            else {
                this.width = 0;
            }
        }
    }

    release(recusive?: boolean) {
        Action.stop(this);

        if (recusive && this.children) {
            while (this.children.length) {
                this.children[0].release(recusive);
            }
        }
        else if (this.children && this.children.length) {
            while (this.children.length) {
                super.removeChild(this.children[0]);
            }
        }

        if (this.parent) {
            this.parent.removeChild(this);
        }

        ReleasePool.instance.add(this);
        this.removeAllListeners();
    }
}