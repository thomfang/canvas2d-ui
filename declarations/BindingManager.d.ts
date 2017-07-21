import { IComponent } from './ComponentManager';
import { VirtualView } from './ViewManager';
export declare class BindingManager {
    private static terminalDirectives;
    private static registeredDirectives;
    private static componentDirectives;
    static registerDirective(name: string, directiveCtor: Function, isTerminal?: boolean, priority?: number): void;
    static getHighestPriorityTerminal(target: any): string;
    static isDirective(name: string): boolean;
    static createBinding(component: IComponent, view: VirtualView, context?: any): IDirective[];
    static removeBinding(component: IComponent): void;
    static createDirective(ctor: Function, expression: string, component: IComponent, view: any, context: any): void;
    static addDirective(component: IComponent, directive: IDirective): void;
    static getComponentDirectives(component: IComponent): IDirective[];
    static removeDirective(component: IComponent, directive: IDirective): void;
    static createAttributeBinding(attrName: string, expression: string, component: IComponent, view: any, twoWayBinding?: boolean): void;
    private static createEventBinding(eventName, expression, component, view);
}
export interface IDirective {
    onInit?(expression: string, component: IComponent, view: VirtualView, context: any): any;
    onDestroy?(): any;
}
export declare function Directive(name: string, isTerminal?: boolean, priority?: number): (ctor: Function) => void;
