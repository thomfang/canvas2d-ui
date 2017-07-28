import { StageProps, Stage } from 'canvas2djs';
import { IComponent } from './ComponentManager';
import { Resource, ResourceType } from './Loader';
export declare class Application {
    private onLoadStart;
    private onLoaded;
    private onLoadingProgress;
    private onLoadingError;
    private version;
    private loadedComponents;
    private stage;
    private indexUrl;
    private routers;
    private currState;
    private lastState;
    private currRouter;
    private currComponentName;
    private currComponent;
    private currScene;
    private isLoadingSceneReady;
    private loadingSceneComponent;
    private loadingScene;
    private loadingSceneResources;
    private loadingSceneTemplate;
    getStage(): Stage;
    setVersion(version: string): void;
    getVersion(): string;
    createLoadingScene(options: LoadingSceneOptions): void;
    createStage(stageProps: StageProps): void;
    setIndexUrl(indexUrl: string): void;
    navigate(url: string, replaceState?: boolean): void;
    registerRouter(routerOptions: RouterOptions): void;
    start(url?: string): void;
    parseState(url: string): {
        state: RouterState;
        router: ParsedRouter;
    };
    destroy(): void;
    private onUrlChanged(url);
    private replaceState(state, router);
    private loadComponentResource(router);
    private createComponent(router);
    private initLoadingScene();
    private setLoadingState(isLoading);
    private registerHashChangeEvent();
}
export declare type RouterOptions = {
    [name: string]: {
        component: string;
        resources: Resource[];
        template: string;
        onEnter?(state: RouterState, next: Function);
        onLeave?(nextState: RouterState);
    };
};
export declare type RouterState = {
    url: string;
    path: string;
    params: {
        [name: string]: any;
    };
};
export declare type LoadingSceneOptions = {
    template: string;
    component: string;
    resources: Resource[];
    onLoadStart?(loadingSceneComponent, componentName: string);
    onLoadingProgress?(loadingSceneComponent, componentName: string, loadedPercent: number);
    onLoaded?(loadingSceneComponent, componentName: string, next: Function);
    onLoadingError?(loadingSceneComponent, type: ResourceType, url: string, version: string);
};
export interface IComponentWithRouter extends IComponent {
    onEnter?(currState: RouterState, lastState: RouterState): any;
}
export declare type ParsedRouter = {
    path: string;
    reg: RegExp;
    params: string[];
    component: string;
    resources: Resource[];
    template: string;
    onEnter?(state: RouterState, next: Function);
    onLeave?(nextState: RouterState);
};
