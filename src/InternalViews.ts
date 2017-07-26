import { ComponentManager } from './ComponentManager';
import { Sprite, TextLabel, BMFontLabel, Texture } from 'canvas2djs';
import { ScrollView } from './ScrollView';
import { AutoLayoutView } from './AutoLayoutView';
import { AutoResizeView } from './AutoResizeView';

var SpriteProperties = {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    scaleX: Number,
    scaleY: Number,
    originX: Number,
    originY: Number,
    bgColor: [String, Number],
    radius: Number,
    borderWidth: Number,
    borderColor: [String, Number],
    texture: String,
    rotation: Number,
    opacity: Number,
    visible: Boolean,
    alignX: Number,
    alignY: Number,
    flippedX: Boolean,
    flippedY: Boolean,
    clipOverflow: Boolean,
    top: Number,
    right: Number,
    bottom: Number,
    left: Number,
    percentWidth: Number,
    percentHeight: Number,
    grid: Array,
    sourceX: Number,
    sourceY: Number,
    sourceWidth: Number,
    sourceHeight: Number,
    blendMode: Number,
    autoResize: Boolean,
    touchEnabled: Boolean,
    mouseEnabled: Boolean,
};
var TextLabelProperties = {
    ...SpriteProperties,
    text: String,
    fontName: String,
    textAlign: String,
    fontColor: [String, Number],
    fontSize: Number,
    lineHeight: Number,
    fontStyle: String,
    fontWeight: String,
    strokeColor: [String, Number],
    strokeWidth: Number,
    wordWrap: Boolean,
    textFlow: Array,
    autoResizeWidth: Boolean,
};
var BMFontLabelProperties = {
    ...SpriteProperties,
    textureMap: Object,
    text: String,
    textAlign: String,
    wordWrap: Boolean,
    wordSpace: Number,
    lineHeight: Number,
    fontSize: Number,
    autoResizeHeight: Boolean,
};
// var ScrollViewProperties = {
//     ...SpriteProperties,
//     bounce: Boolean,
//     horizentalScroll: Boolean,
//     verticalScroll: Boolean,
// };
// var AutoLayoutViewProperties = {
//     ...ScrollViewProperties,
//     layout: Number,
//     verticalSpacing: Number,
//     horizentalSpacing: Number,
// };
// var AutoResizeViewProperties = {
//     ...SpriteProperties,
//     layout: Number,
//     marginLeft: Number,
//     marginRight: Number,
//     marginTop: Number,
//     marginBottom: Number,
//     verticalSpacing: Number,
//     horizentalSpacing: Number,
//     alignChild: Number,
// };

ComponentManager.registerBaseComponent("sprite", Sprite);
// ComponentManager.registerBaseComponent("text", TextLabel);
// ComponentManager.registerBaseComponent("bmfont", BMFontLabel);
ComponentManager.registerComponentProperties(Sprite, SpriteProperties);
ComponentManager.registerComponentProperties(TextLabel, TextLabelProperties);
ComponentManager.registerComponentProperties(BMFontLabel, BMFontLabelProperties);
// ComponentManager.registerComponentProperties(ScrollView, ScrollViewProperties);
// ComponentManager.registerComponentProperties(AutoLayoutView, AutoLayoutViewProperties);
// ComponentManager.registerComponentProperties(AutoResizeView, AutoResizeViewProperties);