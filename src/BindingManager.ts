import { IComponent, ComponentManager } from './ComponentManager';
import { VirtualView, ViewManager } from './ViewManager';
import { Utility } from './Utility';
// import { Parser } from './Parser';
import { ExpParser } from './ExpParser';
import { WatcherManager } from './WatcherManager';
import { EventEmitter } from 'canvas2djs';

export class BindingManager {

    private static activedDirectives: { [uid: string]: boolean } = {};
    private static terminalDirectives: string[] = [];
    private static registeredDirectives: { [name: string]: { ctor: Function; isTerminal?: boolean; priority?: number; } } = {};
    private static componentDirectives: { [id: string]: IDirective[] } = {};

    public static registerDirective(name: string, directiveCtor: Function, isTerminal?: boolean, priority?: number) {
        if (this.registeredDirectives[name] != null) {
            Utility.warn(`Directive "${name}" is override.`, directiveCtor);
        }
        this.registeredDirectives[name] = { ctor: directiveCtor, isTerminal, priority };
        this.terminalDirectives = Object.keys(this.registeredDirectives)
            .filter(name => this.registeredDirectives[name].isTerminal)
            .sort((a, b) => this.registeredDirectives[b].priority - this.registeredDirectives[a].priority);
    }

    public static getHighestPriorityTerminal(target) {
        return this.terminalDirectives.filter(name => target[name] != null)[0];
    }

    public static isRegisteredDirective(name: string) {
        return this.registeredDirectives[name] != null;
    }

    public static createBinding(component: IComponent, view: VirtualView, context = {} as any) {
        let directives = this.getComponentDirectives(component);
        let startIndex = directives.length;
        if (view.directives) {
            for (let name in view.directives) {
                let exp = view.directives[name];
                if (this.registeredDirectives[name]) {
                    this.createDirective(this.registeredDirectives[name].ctor, exp, component, view, context);
                }
                else if (name.slice(0, 2) === '::') {
                    this.createAttributeBinding(name.slice(2), exp, component, view.instance, true);
                }
                else if (name[0] === '@') {
                    this.createEventBinding(name.slice(1), exp, component, view.instance);
                }
                else if (name[0] === ':') {
                    this.createAttributeBinding(name.slice(1), exp, component, view.instance);
                }
                else if (ExpParser.hasInterpolation(exp)) {
                    this.createAttributeBinding(name, exp, component, view.instance);
                }
                else {
                    Utility.warn(`Unknow directive '${name}="${exp}".'`);
                }
            }
        }
        if (view.isComponent) {
            this.createComponentBinding(component, view);
        }
        else if (view.child) {
            for (let i = 0, v: VirtualView; v = view.child[i]; i++) {
                this.createBinding(component, v, context)
            }
        }

        return directives.slice(startIndex);
    }

    public static removeBinding(component: IComponent) {
        let uid = Utility.getUid(component);
        let directives = this.componentDirectives[uid];
        if (directives) {
            let list = directives.slice();
            for (let i = 0, directive: IDirective; directive = list[i]; i++) {
                this.removeDirective(component, directive);
            }
            delete this.componentDirectives[uid];
        }
    }

    public static createDirective(ctor: Function, expression: string, component: IComponent, view: any, context) {
        let directive: IDirective = new (ctor as any)();
        if (typeof directive.onInit === 'function') {
            directive.onInit(expression, component, view, context);
        }
        this.addDirective(component, directive);
    }

    public static addDirective(component: IComponent, directive: IDirective) {
        if (Utility.addEnsureUniqueArrayItem(directive, this.getComponentDirectives(component))) {
            this.activedDirectives[Utility.getUid(directive)] = true;
        }
    }

    public static getComponentDirectives(component: IComponent) {
        let uid = Utility.getUid(component);
        if (!this.componentDirectives[uid]) {
            this.componentDirectives[uid] = [];
        }
        return this.componentDirectives[uid];
    }

    public static removeDirective(component: IComponent, directive: IDirective) {
        let uid = Utility.getUid(directive);
        let directives = this.componentDirectives[Utility.getUid(component)];
        if (!this.activedDirectives[uid] || !directives) {
            return;
        }
        if (typeof directive.onDestroy === 'function') {
            directive.onDestroy();
        }
        Utility.removeItemFromArray(directive, directives);
        delete this.activedDirectives[uid];
    }

    public static createComponentBinding(component: IComponent, view: VirtualView) {
        let context = {};
        if (view.nestChild) {
            for (let i = 0, v: VirtualView; v = view.nestChild[i]; i++) {
                this.createBinding(component, v, context);
            }
        }
        if (view.child) {
            if (typeof view.instance.onBeforeMount === 'function') {
                view.instance.onBeforeMount(view);
            }
            this.createBinding(view.instance, view.child[0], context);
            if (typeof view.instance.onAfterMounted === 'function') {
                view.instance.onAfterMounted();
            }
            let directive: IDirective = {
                onDestroy: () => {
                    ComponentManager.destroyComponent(view.instance);
                    view.child[0].sprite.release(true);
                },
            };
            this.addDirective(component, directive);
        }
    }

    public static createAttributeBinding(attrName: string, expression: string, component: IComponent, view, twoWayBinding?: boolean) {
        let value;
        let unWatchComponent = WatcherManager.watch(component, expression, (newValue, oldValue) => {
            value = newValue;
            ViewManager.setAttribute(view, attrName, newValue);
        }, true, true);
        let unWatchView: Function = twoWayBinding && WatcherManager.watch(view, attrName, (newValue, oldValue) => {
            if (value === newValue) {
                return;
            }
            ViewManager.setAttribute(component, expression, newValue);
        }, true);
        let directive: IDirective = {
            onDestroy: () => {
                unWatchComponent();
                unWatchView && unWatchView();
            },
        };
        this.addDirective(component, directive);
    }

    private static createEventBinding(eventName: string, expression: string, component: IComponent, view) {
        let hasAddListener = typeof view.addListener === 'function';
        let hasEmitter = view.emitter instanceof EventEmitter;
        if (!hasEmitter && !hasAddListener) {
            return Utility.error(`Could not register event '@${eventName}="${expression}"', the view is not an EventEmitter like object.`, view);
        }
        let func = ExpParser.parseNormalExp(expression) as Function;
        let handler = (e) => {
            func.call(component, e, view, window);
        };
        let directive = {
            onDestroy: () => {
                if (hasAddListener) {
                    view.removeListener(eventName, handler);
                }
                else {
                    view.emitter.removeListener(eventName, handler);
                }
            }
        };
        if (hasAddListener) {
            view.addListener(eventName, handler);
        }
        else {
            view.emitter.addListener(eventName, handler);
        }
        this.addDirective(component, directive);
    }
}

export interface IDirective {
    onInit?(expression: string, component: IComponent, view: VirtualView, context);
    onDestroy?();
}

export function Directive(name: string, isTerminal?: boolean, priority?: number) {
    return (ctor: Function) => {
        BindingManager.registerDirective(name, ctor, isTerminal, priority);
    }
}

/**
 * @Directive(":repeat")
 * class RepeatDirective {
 *     onInit(component, views) {
 *         
 *     }
 * }
 */