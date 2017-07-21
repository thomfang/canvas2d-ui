import { EventEmitter } from 'canvas2djs';
export declare class Observer extends EventEmitter {
    private propertyChangedListeners;
    addPropertyChangedListener(listener: Function): void;
    removePropertyChangedListener(listener: Function): void;
    emitPropertyChanged(): void;
}
