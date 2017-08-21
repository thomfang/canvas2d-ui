import { Sprite, TextLabel, ITextLabel, BMFontLabel, SpriteProps, Action, ActionQueue, ActionRepeatMode } from 'canvas2djs';
import { Utility } from './Utility';
import { Parser } from './Parser';
import { ComponentManager, IComponent } from './ComponentManager';
import { TemplateManager } from './TemplateManager';
import { StyleManager, ActionStyle } from './StyleManager';
import { Observable } from './Observable';
import { BindingManager } from './BindingManager';
import { ScrollView } from './ScrollView';
import { AutoLayoutView } from './AutoLayoutView';
import { AutoResizeView } from './AutoResizeView';

const reBindableAttr = /^[:@]/;

export class ViewManager {

    public static createView(node: VirtualNode): VirtualView {
        if (node.attr) {
            let terminalDirective = BindingManager.getHighestPriorityTerminal(node.attr);
            if (terminalDirective != null) {
                let sprite = new Sprite();
                let attr = { ...node.attr };
                delete attr[terminalDirective];
                return {
                    node: { ...node, attr, },
                    sprite,
                    instance: sprite,
                    directives: { [terminalDirective]: node.attr[terminalDirective] },
                };
            }
        }
        let ctor = ComponentManager.getBaseComponentCtorByName(node.tag);
        if (ctor != null) {
            return this.createSprite(node, new ctor());
        }
        // if (node.tag === "sprite") {
        //     return this.createSprite(node, new Sprite());
        // }
        // if (node.tag === 'ScrollView') {
        //     return this.createSprite(node, new ScrollView());
        // }
        // if (node.tag === 'AutoLayoutView') {
        //     return this.createSprite(node, new AutoLayoutView());
        // }
        // if (node.tag === 'AutoResizeView') {
        //     return this.createSprite(node, new AutoResizeView());
        // }
        if (node.tag === "text" || node.tag === "bmfont") {
            return this.createTextLabel(node);
        }

        return this.createComponent(node);
    }

    public static createSprite(node: VirtualNode, sprite: Sprite<{}>) {
        let view: VirtualView = { instance: sprite, sprite, };

        if (node.attr) {
            let directives: { [name: string]: any };
            Object.keys(node.attr).forEach(name => {
                let value = node.attr[name];
                if (BindingManager.isRegisteredDirective(name) || reBindableAttr.test(name) || Parser.hasInterpolation(value)) {
                    if (!directives) {
                        directives = {};
                    }
                    directives[name] = value;
                }
                else {
                    this.setAttribute(sprite, name, value);
                }
            });

            if (directives) {
                view.directives = directives;
            }
        }
        if (node.child) {
            let children = node.child.map(c => this.createView(c));
            children.forEach(child => {
                sprite.addChild(child.sprite);
            });
            view.child = children;
        }

        return view;
    }

    public static createTextLabel(node: VirtualNode) {
        let textLabel = node.tag === 'text' ? new TextLabel() : new BMFontLabel();
        let view: VirtualView = { instance: textLabel, sprite: textLabel, };

        if (node.attr) {
            let directives: { [name: string]: any };
            Object.keys(node.attr).forEach(name => {
                let value = node.attr[name];
                if (BindingManager.isRegisteredDirective(name) || reBindableAttr.test(name) || Parser.hasInterpolation(value)) {
                    if (!directives) {
                        directives = {};
                    }
                    directives[name] = value;
                }
                else {
                    this.setAttribute(textLabel, name, value);
                }
            });
            if (directives) {
                view.directives = directives;
            }
        }
        if (node.child) {
            let content = node.child.map(child => {
                if (child.type !== 'text') {
                    return Utility.error(`<text> only supports text content.`);
                }
                return child.text;
            }).join("");
            if (Parser.hasInterpolation(content)) {
                if (!view.directives) {
                    view.directives = {};
                }
                view.directives.text = content;
            }
            else {
                textLabel.text = content;
            }
        }
        return view;
    }

    public static createComponent(node: VirtualNode) {
        let component = ComponentManager.createComponentByName(node.tag);
        let view: VirtualView = { instance: component, isComponent: true, };
        let sprite

        if (node.attr) {
            let directives: { [name: string]: any };
            Object.keys(node.attr).forEach(name => {
                let value = node.attr[name];
                if (BindingManager.isRegisteredDirective(name) || reBindableAttr.test(name) || Parser.hasInterpolation(value)) {
                    if (!directives) {
                        directives = {};
                    }
                    directives[name] = value;
                }
                else if (name !== 'template') {
                    this.setAttribute(component, name, value);
                }
            });
            if (directives) {
                view.directives = directives;
            }

            if (node.attr.template) {
                let template = TemplateManager.getTemplateByName(node.attr.template);
                if (template == null) {
                    Utility.error(`Template "${node.attr.template}" not found.`);
                }

                let templateView = this.createView(template);
                view.sprite = templateView.sprite;
                view.child = [templateView];
            }
            else {
                Utility.error(`Template of component "${node.tag}" not given.`);
            }
        }
        if (node.child) {
            view.nestChild = node.child.map(c => this.createView(c));
        }

        return view;
    }

    public static setAttribute(object, attrName: string, attrValue: any) {
        if (attrName === "styles") {
            if (typeof object.setProps === 'function') {
                let styleProps: SpriteProps;
                if (typeof attrValue === 'string') {
                    attrValue = attrValue.trim().split(/\s+/);
                }
                else if (Object.prototype.toString.call(attrValue) === '[object Object]') {
                    attrValue = Object.keys(attrValue).filter(name => !!attrValue[name]);
                }
                if (Array.isArray(attrValue)) {
                    styleProps = {};
                    attrValue.forEach(styleName => {
                        let style = StyleManager.getStyleByName(styleName);
                        if (!style) {
                            Utility.warn(`Style "${styleName}" not found.`);
                        }
                        else {
                            styleProps = { ...styleProps, ...style };
                        }
                    });
                }
                // else if (Object.prototype.toString.call(attrValue) === '[object Object]') {
                //     styleProps = attrValue;
                // }
                else {
                    return Utility.warn(`Invalid style value:`, attrValue);
                }
                object.setProps(styleProps);
            }
            else {
                object[attrName] = attrValue;
            }
            return;
        }
        if (attrName === 'actions') {
            if (typeof attrValue === 'string') {
                let style = StyleManager.getStyleByName(attrValue) as ActionStyle;
                if (style == null) {
                    return Utility.error(`Action "${attrValue}" not found.`);
                }
                if (style.startProps) {
                    object.setProps(style.startProps);
                }
                let action = new Action(object, name).queue(style.queue);
                if (style.repeatMode != null) {
                    action.setRepeatMode(style.repeatMode);
                }
                action.start();
            }
            else if (Object.prototype.toString.call(attrValue) === '[object Object]') {
                Object.keys(attrValue).forEach(name => {
                    if (!attrValue[name]) {
                        return Action.stop(object, name);
                    }
                    let style = StyleManager.getStyleByName(name) as ActionStyle;
                    if (style == null) {
                        return Utility.error(`Action "${name}" not found.`);
                    }
                    if (style.startProps) {
                        object.setProps(style.startProps);
                    }
                    let action = new Action(object, name).queue(style.queue);
                    if (style.repeatMode != null) {
                        action.setRepeatMode(style.repeatMode);
                    }
                    action.start();
                });
            }
            else {
                Utility.error(`Invalid action directive, value is not an object`, attrValue);
            }
            return;
        }

        let registerProperties = ComponentManager.getRegisteredComponentProperties(object);
        if (!registerProperties || registerProperties[attrName] == null || attrValue == null) {
            return object[attrName] = attrValue;
        }

        let ctor = registerProperties[attrName];
        if (Array.isArray(ctor)) {
            if (ctor.some(f => attrValue.constructor === f)) {
                object[attrName] = attrValue;
            }
            else {
                Utility.warn(`TypeError for attribute "${attrName}"`, object, attrValue);
            }
            return;
        }

        switch (registerProperties[attrName]) {
            case Function:
            case Object:
            case Array:
                if (attrValue.constructor !== registerProperties[attrName]) {
                    Utility.warn(`TypeError for attribute "${attrName}"`, object, attrValue);
                }
                else {
                    object[attrName] = attrValue;
                }
                break;
            case Boolean:
                if (attrValue === 'true') {
                    object[attrName] = true;
                }
                else if (attrValue === 'false') {
                    object[attrName] = false;
                }
                else {
                    object[attrName] = !!attrValue;
                }
                break;
            case Number:
                attrValue = Number(attrValue);
                if (!isNaN(attrValue)) {
                    object[attrName] = attrValue;
                }
                break;
            case String:
                if (Object.prototype.toString.call(attrValue) === '[object Object]') {
                    let values = Object.keys(attrValue).filter(name => !!attrValue[name]);
                    if (values.length) {
                        object[attrName] = values[values.length - 1];
                    }
                }
                else {
                    attrValue = String(attrValue);
                    object[attrName] = attrValue;
                }
                break;
        }
    }
}

export type VirtualNode = {
    type: "text" | "element";
    text?: string;
    tag?: string;
    attr?: { [name: string]: string };
    child?: VirtualNode[];
}

export type VirtualView = {
    instance: any;
    sprite?: Sprite<{}>;
    child?: VirtualView[];
    nestChild?: VirtualView[];
    directives?: { [name: string]: string };
    isComponent?: boolean;
    node?: VirtualNode;
}