import { Sprite, SpriteProps, AlignType } from 'canvas2djs';
import { Layout } from './AutoLayoutView';
export declare type AutoResizeViewProps = SpriteProps & {
    layout?: Layout;
    alignChild?: AlignType;
    marginLeft?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    verticalSpacing?: number;
    horizentalSpacing?: number;
};
export declare class AutoResizeView extends Sprite<AutoResizeViewProps> {
    protected _isPending: boolean;
    protected _layout: Layout;
    protected _alignChild: AlignType;
    protected _marginLeft: number;
    protected _marginTop: number;
    protected _marginRight: number;
    protected _marginBottom: number;
    protected _verticalSpacing: number;
    protected _horizentalSpacing: number;
    constructor(props?: {});
    marginLeft: number;
    marginRight: number;
    marginBottom: number;
    marginTop: number;
    verticalSpacing: number;
    horizentalSpacing: number;
    layout: Layout;
    alignChild: AlignType;
    addChild(target: Sprite<{}>, position?: number): void;
    removeChild(target: Sprite<{}>): void;
    protected _onChildResize(): void;
    protected reLayout(): void;
}
