import { VirtualNode } from './ViewManager';
export declare class TemplateManager {
    private static registeredParsedTemplateByName;
    static registerHtmlTemplate(name: string, template: string): void;
    static registerJsonTemplate(name: string, template: VirtualNode): void;
    static getTemplateByName(name: string): VirtualNode;
}
