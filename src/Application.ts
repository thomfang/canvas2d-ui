import { StageProps, Stage, Sprite, SpriteProps } from 'canvas2djs';
import { pathToRegexp } from './PathToRegexp';
import { IComponent, ComponentManager } from './ComponentManager';
import { Resource, Loader, ResourceType } from './Loader';
import { ViewManager } from './ViewManager';
import { TemplateManager } from './TemplateManager';
import { Utility } from './Utility';

const ContainerProps: SpriteProps = { left: 0, right: 0, top: 0, bottom: 0 };

export class Application {
    private onLoadStart: (loadingSceneComponent: any, componentName: string) => any;
    private onLoaded: (loadingSceneComponent: any, componentName: string, next: Function) => any;
    private onLoadingProgress: (loadingSceneComponent: any, componentName: string, loadedPercent: number) => any;
    private onLoadingError: (loadingSceneComponent: any, type: ResourceType, url: string, version: string) => any;

    private version: string;
    private loadedComponents: string[] = [];

    private stage: Stage;

    private indexUrl: string;
    private routers: ParsedRouter[] = [];
    private currState: RouterState;
    private lastState: RouterState;
    private currRouter: ParsedRouter;

    private currSceneName: string;
    private currSceneComponent: IComponentWithRouter;
    private currScene: Sprite<{}> = new Sprite(ContainerProps);

    private isLoadingSceneReady: boolean;
    private loadingSceneComponent: IComponent;
    private loadingScene: Sprite<{}> = new Sprite(ContainerProps);
    private loadingSceneResources: Resource[];
    private loadingSceneTemplate: string;

    public getStage() {
        return this.stage;
    }

    public setVersion(version: string) {
        this.version = version;
    }

    public getVersion() {
        return this.version;
    }

    public createLoadingScene(options: LoadingSceneOptions) {
        this.loadingSceneResources = options.resources;
        this.loadingSceneTemplate = options.template;
        this.onLoadingError = options.onLoadingError;
        this.onLoadingProgress = options.onLoadingProgress;
        this.onLoaded = options.onLoaded || ((a, b, next) => next());
        this.onLoadStart = options.onLoadStart;
        this.loadingSceneComponent = ComponentManager.createComponentByName(options.component);
    }

    public createStage(stageProps: StageProps) {
        this.stage = new Stage(
            stageProps.canvas,
            stageProps.width,
            stageProps.height,
            stageProps.scaleMode,
            !!stageProps.autoAdjustCanvasSize,
            stageProps.orientation
        );
        this.stage.mouseEnabled = !!stageProps.mouseEnabled;
        this.stage.touchEnabled = !!stageProps.touchEnabled;
    }

    public setIndexUrl(indexUrl: string) {
        this.indexUrl = indexUrl;
    }

    public navigate(url: string, replaceState?: boolean) {
        if (replaceState) {
            location.replace(url);
        }
        else {
            location.href = url;
        }
    }

    public registerRouter(routerOptions: RouterOptions) {
        Object.keys(routerOptions).forEach(path => {
            let options = routerOptions[path];
            let reg = pathToRegexp(path);
            let params = reg.keys.map(key => key.name);

            delete reg.keys;

            this.routers.push({
                ...options,
                reg,
                path,
                params,
            });
        });
    }

    public start(url = location.hash.slice(1)) {
        if (this.version == null) {
            Utility.error(`Application version required.`);
        }
        this.registerHashChangeEvent();
        this.initLoadingScene();
        this.onUrlChanged(url);
    }

    public parseState(url: string): { state: RouterState; router: ParsedRouter } {
        var saveParam = (param, j) => {
            params[param] = result[j + 1];
        };
        var result: RegExpExecArray;
        var params: { [name: string]: any };

        for (let i = 0; i < this.routers.length; i++) {
            let router = this.routers[i];

            if (router.reg.test(url)) {
                result = router.reg.exec(url);
                params = {};
                router.params.forEach(saveParam);
                return {
                    state: {
                        url,
                        path: router.path,
                        params,
                    },
                    router,
                };
            }
        }
    }

    public destroy() {
        this.loadingSceneComponent && ComponentManager.destroyComponent(this.loadingSceneComponent);
        this.currSceneComponent && ComponentManager.destroyComponent(this.currSceneComponent);
        this.stage.release();
        this.loadingScene = this.loadingSceneComponent = null;
        this.currRouter = this.currScene = this.currSceneComponent = null;
        this.stage = null;
    }

    private onUrlChanged(url: string) {
        var result: { state: RouterState; router: ParsedRouter };

        if (!url || !(result = this.parseState(url))) {
            // return this.navigate('#' + this._rootUrl, true);
            if (this.indexUrl === url) {
                Utility.error(`Invalid index url "${this.indexUrl}"`);
            }
            this.navigate('#' + this.indexUrl, true);
            return;
        }

        this.lastState = this.currState;
        this.currState = result.state;

        if (this.currSceneComponent) {
            if (this.currSceneName === result.router.component) {
                if (typeof this.currSceneComponent.onEnter === 'function') {
                    this.currSceneComponent.onEnter(result.state, this.lastState);
                }
                return;
            }
            ComponentManager.destroyComponent(this.currSceneComponent);
            this.currSceneComponent = null;
            this.currScene.removeAllChildren(true);
        }

        this.loadComponentResource(result.router);
    }

    private loadComponentResource(router: ParsedRouter) {
        this.currRouter = router;

        if (!this.isLoadingSceneReady) {
            return;
        }
        if (this.loadedComponents.indexOf(router.component) < 0) {
            this.setLoadingState(true);

            this.onLoadStart && this.onLoadStart(this.loadingSceneComponent, router.component);

            Loader.load(router.resources, this.version, () => {
                Utility.addEnsureUniqueArrayItem(router.component, this.loadedComponents);
                this.onLoaded(this.loadingSceneComponent, router.component, () => {
                    if (this.currRouter === router) {
                        this.createComponent(router);
                    }
                });
            }, (loadedPercent: number) => {
                this.onLoadingProgress && this.onLoadingProgress(this.loadingSceneComponent, router.component, loadedPercent);
            }, (type: ResourceType, url: string, version: string) => {
                this.onLoadingError && this.onLoadingError(this.loadingSceneComponent, type, url, version);
            });
        }
        else {
            this.createComponent(router);
        }
    }

    private createComponent(router: ParsedRouter) {
        let view = ViewManager.createView(TemplateManager.getTemplateByName(router.template));
        let component: IComponentWithRouter = ComponentManager.createComponentByName(router.component);

        ComponentManager.mountComponent(component, view);

        if (typeof component.onEnter === 'function') {
            component.onEnter(this.currState, this.lastState);
        }

        this.currSceneComponent = component;
        this.currScene.addChild(view.sprite);
        this.setLoadingState(false);
    }

    private initLoadingScene() {
        Loader.load(this.loadingSceneResources, this.version, () => {
            let view = ViewManager.createView(TemplateManager.getTemplateByName(this.loadingSceneTemplate));

            this.loadingScene.addChild(view.sprite);
            ComponentManager.mountComponent(this.loadingSceneComponent, view);
            this.isLoadingSceneReady = true;

            if (this.currRouter) {
                this.loadComponentResource(this.currRouter);
            }
        }, null, (type: ResourceType, url: string, version: string) => {
            this.onLoadingError && this.onLoadingError(this.loadingSceneComponent, type, url, version);
        });
    }

    private setLoadingState(isLoading: boolean) {
        if (isLoading) {
            if (this.currScene.parent) {
                this.stage.removeChild(this.currScene);
            }
            if (!this.loadingScene.parent) {
                this.stage.addChild(this.loadingScene, 0);
            }
        }
        else {
            if (!this.currScene.parent) {
                this.stage.addChild(this.currScene, 0);
            }
            if (this.loadingScene.parent) {
                this.stage.removeChild(this.loadingScene);
            }
        }
    }

    private registerHashChangeEvent() {
        window.addEventListener("hashchange", () => {
            this.onUrlChanged(location.hash.slice(1));
        });
    }
}

export type RouterOptions = {
    [name: string]: {
        component: string;
        resources: Resource[];
        template: string;
    }
}

export type RouterState = {
    url: string;
    path: string;
    params: { [name: string]: any };
}

export type LoadingSceneOptions = {
    template: string;
    component: string;
    resources: Resource[];
    onLoadStart?(loadingSceneComponent, componentName: string);
    onLoadingProgress?(loadingSceneComponent, componentName: string, loadedPercent: number);
    onLoaded?(loadingSceneComponent, componentName: string, next: Function);
    onLoadingError?(loadingSceneComponent, type: ResourceType, url: string, version: string);
}

export interface IComponentWithRouter extends IComponent {
    onEnter?(currState: RouterState, lastState: RouterState);
}

export type ParsedRouter = {
    path: string;
    reg: RegExp;
    params: string[];
    component: string;
    resources: Resource[];
    template: string;
};