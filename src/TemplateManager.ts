import { VirtualNode } from './ViewManager';
import { parseTemplateToVirtualNode } from './TemplateParser';

export class TemplateManager {

    private static registeredParsedTemplateByName: { [name: string]: VirtualNode } = {};

    public static registerHtmlTemplate(name: string, template: string) {
        this.registeredParsedTemplateByName[name] = parseTemplateToVirtualNode(template);
    }

    public static registerJsonTemplate(name: string, template: VirtualNode) {
        this.registeredParsedTemplateByName[name] = template;
    }

    public static getTemplateByName(name: string) {
        return this.registeredParsedTemplateByName[name];
    }
}