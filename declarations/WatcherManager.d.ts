import { IComponent } from './ComponentManager';
import { WatcherCallback } from './Watcher';
export declare class WatcherManager {
    private static componentWatchers;
    static watch(component: IComponent, expression: string, callback: WatcherCallback, isDeepWatch?: boolean, immediate?: boolean): () => void;
    static removeWatcher(component: IComponent, key: string): void;
    static removeWatchers(component: IComponent): void;
}
