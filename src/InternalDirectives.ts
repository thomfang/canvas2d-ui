import { Sprite } from 'canvas2djs';
import { Directive, IDirective, BindingManager } from './BindingManager';
import { IComponent, ComponentManager, Component } from './ComponentManager';
import { WatcherManager } from './WatcherManager';
import { VirtualView, ViewManager } from './ViewManager';
import { WeakRef } from './WeakRef';
import { Utility } from './Utility';
import { TemplateManager } from './TemplateManager';

const regParam = /\s+in\s+/;
const regComma = /\s*,\s*/;

@Directive(":include")
class IncludeDirective {

    view: VirtualView;
    component: IComponent;
    directives: IDirective[];
    currSprite: Sprite<{}>;
    parentSprite: Sprite<{}>;

    onInit(templateName: string, component: IComponent, view: VirtualView, context) {
        this.view = view;
        this.component = component;
        this.parentSprite = view.sprite.parent;

        let node = TemplateManager.getTemplateByName(templateName);
        if (node == null) {
            return Utility.warn(`Error updating directive ':include="${templateName}", template "${templateName}" not found.'`);
        }
        let newView = ViewManager.createView(node);

        this.parentSprite.replaceChild(view.sprite, newView.sprite);
        this.directives = BindingManager.createBinding(this.component, newView);
        this.currSprite = newView.sprite;
    }

    removeTemplate() {
        if (this.directives) {
            this.directives.forEach(directive => {
                BindingManager.removeDirective(this.component, directive);
            });
            this.parentSprite.replaceChild(this.currSprite, this.view.sprite);
            this.directives = this.currSprite = null;
        }
    }

    onDestroy() {
        this.removeTemplate();
        this.view = this.component = null;
    }
}

@Directive(":if", true, 200)
class ConditionDirective {

    view: VirtualView;
    unWatch: Function;
    component: IComponent;
    parentSprite: Sprite<{}>;
    currSprite: Sprite<{}>;
    directives: IDirective[];

    onInit(expression: string, component: IComponent, view: VirtualView, context) {
        this.view = view;
        this.component = component;
        this.parentSprite = view.sprite.parent;
        this.unWatch = WatcherManager.watch(component, expression, (newValue) => {
            this.onUpdate(!!newValue);
        }, true, true);
    }

    onUpdate(newValue: boolean) {
        if (newValue && !this.directives) {
            let newView = ViewManager.createView(this.view.node);
            this.parentSprite.replaceChild(this.view.sprite, newView.sprite);
            this.currSprite = newView.sprite;
            this.directives = BindingManager.createBinding(this.component, newView);
        }
        else if (!newValue) {
            this.removeBinding();
        }
    }

    removeBinding() {
        if (this.directives) {
            this.directives.forEach(directive => {
                BindingManager.removeDirective(this.component, directive);
            });
            this.parentSprite.replaceChild(this.currSprite, this.view.sprite);
            this.currSprite = this.directives = null;
        }
    }

    onDestroy() {
        this.removeBinding();
        this.unWatch();
        this.component = this.view = this.unWatch = this.parentSprite = null;
    }
}

@Directive(":slot-to")
class SlotToDirective implements IDirective {

    onInit(name: string, component: IComponent, view: VirtualView, context) {
        if (!context.slotViews) {
            context.slotViews = {};
        }
        if (!context.slotViews[name]) {
            context.slotViews[name] = [];
        }
        context.slotViews[name].push(view);
    }
}

@Directive(":slot")
class SlotPlaceholderDirective implements IDirective {

    onInit(name: string, component: IComponent, view: VirtualView, context) {
        if (!(view.instance instanceof Sprite)) {
            return Utility.error(`Component could not use the slot="${name}" directive.`, view);
        }
        if (!context.slotViews || !context.slotViews[name]) {
            return;
        }

        let slotViews = context.slotViews[name];
        let placeholder: Sprite<{}> = view.instance;
        let slotSprites: Sprite<{}>[] = [];

        slotViews.forEach(slotView => {
            slotSprites.push(...slotView.sprites);
        });
        placeholder.parent.replaceChild(placeholder, ...slotSprites);
    }
}

@Directive(":ref")
class ReferenceDirective implements IDirective {

    refName: string;
    component: IComponent;

    onInit(refName: string, component: IComponent, view: VirtualView, context) {
        this.refName = refName;
        this.component = component;
        WeakRef.set(refName, component, view.instance);
    }

    onDestroy() {
        WeakRef.remove(this.refName, this.component);
        this.refName = this.component = null;
    }
}

@Directive(":for", true, 100)
class ForLoopDirective implements IDirective {

    private static itemComponentCtors: { [expression: string]: Function } = {};

    refKey: string;
    expression: string;
    view: VirtualView;
    component: IComponent;
    keyValueName: { key: string; value: string };
    itemDatas: ItemDataDescriptor[];
    itemComponents: IItemComponent[];
    itemComponentCtor: Function;
    itemSprites: Sprite<{}>[];
    unWatch: Function;

    onInit(expression: string, component: IComponent, view: VirtualView, context) {
        this.refKey = `component:${Utility.getUid(this)}`;
        this.view = view;
        this.component = component;
        this.itemDatas = [];
        this.itemSprites = [];
        this.parseExpression(expression);
        this.unWatch = WatcherManager.watch(component, this.expression, (newValue, oldValue) => {
            this.onUpdate(newValue, oldValue);
        }, true, true);
    }

    onUpdate(newValue, oldValue) {
        let itemDatas = this.itemDatas = this.toList(newValue);
        let notAnyItems = !this.itemComponents || this.itemComponents.length === 0;
        let newItemComponents: IItemComponent[] = [];

        itemDatas.forEach((item, index) => {
            let itemComponent = newItemComponents[index] = this.getItemComponentByItem(item);
            itemComponent.__idle__ = false;
        });

        if (!notAnyItems) {
            this.removeItemComponents();
        }

        newItemComponents.forEach(itemVm => itemVm.__idle__ = true);
        this.itemComponents = newItemComponents;
    }

    getItemComponentByItem(item: ItemDataDescriptor): IItemComponent {
        let value = item.value;
        let components = WeakRef.get(this.refKey, value);
        let itemComponent: IItemComponent;

        if (components) {
            for (let i = 0; itemComponent = components[i]; i++) {
                if (itemComponent.__idle__) {
                    break;
                }
            }
        }
        if (itemComponent) {
            this.updateItemComponent(itemComponent, item);
        }
        else {
            itemComponent = this.createItemComponent(item);
            let view = ViewManager.createView(this.view.node);
            let index = Math.max(0, this.view.sprite.parent.children.indexOf(this.view.sprite));
            this.view.sprite.parent.addChild(view.sprite, index);
            // this.itemSprites.push()
            ComponentManager.mountComponent(itemComponent, view);
            WeakRef.set(this.refKey, itemComponent, view.sprite);
        }

        return itemComponent;
    }

    updateItemComponent(component: IItemComponent, item: ItemDataDescriptor) {
        let { key, value } = this.keyValueName;

        component.$index = item.index;
        component.$isOdd = 0 === item.index % 2;
        component.$isEven = !component.$isOdd;
        component.$isLast = item.index === this.itemDatas.length - 1;
        component.$isFirst = 0 === item.index;

        if (key != null) {
            component[key] = item.key;
        }
        component[value] = item.value;
    }

    createItemComponent(item: ItemDataDescriptor): IItemComponent {
        let value = item.value;
        let itemComponents: IItemComponent[] = WeakRef.get(this.refKey, value);
        let itemComponent: IItemComponent = ComponentManager.createComponentByConstructor(this.itemComponentCtor);

        if (itemComponents == null) {
            itemComponents = [];
            WeakRef.set(this.refKey, value, itemComponents);
        }
        itemComponents.push(itemComponent);

        itemComponent.$parent = this.component;
        this.updateItemComponent(itemComponent, item);
        return itemComponent;
    }

    removeItemComponents(forceRemove?: boolean) {
        this.itemComponents.forEach(itemComponent => {
            if (itemComponent.__idle__ || forceRemove) {

                let value = itemComponent[this.keyValueName.value];
                let components = WeakRef.get(this.refKey, value);
                let sprite = WeakRef.get(this.refKey, itemComponent);

                itemComponent.$parent = null;
                ComponentManager.destroyComponent(itemComponent);

                WeakRef.remove(this.refKey, itemComponent);
                if (sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }

                Utility.removeItemFromArray(itemComponent, components);
                if (!components.length) {
                    WeakRef.remove(this.refKey, value);
                }
            }
        });
    }

    parseExpression(expression: string) {
        let parts = expression.split(regParam);

        if (parts.length !== 2) {
            return Utility.error(`Invalid directive syntax ':for="${expression}"'.`);
        }

        let key: string;
        let value: string;
        let params: any = parts[0];

        if (params.indexOf(',') > 0) {
            params = params.split(regComma);
            if (params[0] === '') {
                return Utility.error(`Invalid directive syntax ':for="${expression}"'.`);
            }
            key = params[1];
            value = params[0];
        }
        else {
            value = params;
        }

        if (!ForLoopDirective.itemComponentCtors[expression]) {
            let ctor = function () { };
            let properties = {
                $index: Number,
                $isFirst: Boolean,
                $isLast: Boolean,
                $isOdd: Boolean,
                $isEven: Boolean,
            };
            properties[value] = null;
            if (key) {
                properties[key] = null;
            }
            ForLoopDirective.itemComponentCtors[expression] = ctor;
            ComponentManager.registerComponentProperties(ctor, properties);
        }

        this.keyValueName = { key, value };
        this.expression = parts[1].trim();
        this.itemComponentCtor = ForLoopDirective.itemComponentCtors[expression];
    }

    toList(target: any): ItemDataDescriptor[] {
        let list: ItemDataDescriptor[] = [];

        if (Array.isArray(target)) {
            target.forEach((val, idx) => {
                list.push({
                    key: idx,
                    index: idx,
                    value: val
                });
            });
        }
        else if (Utility.isPlainObjectOrObservableObject(target)) {
            let idx = 0;
            let key;

            for (key in target) {
                list.push({
                    key: key,
                    index: idx++,
                    value: target[key]
                });
            }
        }
        else if (typeof target === 'number') {
            for (let i = 0; i < target; i++) {
                list.push({
                    key: i,
                    index: i,
                    value: i
                });
            }
        }

        return list;
    }

    onDestroy() {
        this.removeItemComponents(true);
        this.unWatch();
        this.component = this.unWatch = this.view = this.itemComponentCtor = this.itemComponents = this.itemDatas = null;
    }
}

interface IItemComponent extends IComponent {
    __idle__: boolean;
    $parent: IComponent;
    $index: number;
    $isOdd: boolean;
    $isEven: boolean;
    $isLast: boolean;
    $isFirst: boolean;
}

type ItemDataDescriptor = {
    key: string | number;
    index: number;
    value: any;
}