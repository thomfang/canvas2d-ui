import { IComponent } from './ComponentManager';
import { WatcherCallback, Watcher } from './Watcher';
import { Utility } from './Utility';

export class WatcherManager {

    private static componentWatchers: { [uid: string]: { [key: string]: Watcher } } = {};

    public static watch(component: IComponent, expression: string, callback: WatcherCallback, isDeepWatch?: boolean, immediate?: boolean) {
        let uid = Utility.getUid(component);
        if (!this.componentWatchers[uid]) {
            this.componentWatchers[uid] = {};
        }
        let key = Watcher.getKey(expression, isDeepWatch);
        if (!this.componentWatchers[uid][key]) {
            this.componentWatchers[uid][key] = new Watcher(component, expression, isDeepWatch);
        }
        let watcher = this.componentWatchers[uid][key];
        let wrappedCallback = (...args: any[]) => {
            callback.apply(component, args);
        };
        watcher.addCallback(wrappedCallback);

        if (immediate) {
            wrappedCallback(watcher.value, undefined);
        }
        return () => {
            watcher.removeCallback(wrappedCallback);
        };
    }

    public static removeWatcher(component: IComponent, key: string) {
        let watchers = this.componentWatchers[Utility.getUid(component)];
        if (watchers) {
            delete watchers[key];
        }
    }

    public static removeWatchers(component: IComponent) {
        let uid = Utility.getUid(component);
        let watchers = this.componentWatchers[uid];
        if (watchers) {
            for (let key in watchers) {
                watchers[key].destroy();
            }
        }
        delete this.componentWatchers[uid];
    }
}