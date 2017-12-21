import { EventEmitter } from 'canvas2djs';

export class Observer extends EventEmitter {

    private propertyChangedListeners: Function[] = [];

    addPropertyChangedListener(listener: Function) {
        if (this.propertyChangedListeners.indexOf(listener) < 0) {
            this.propertyChangedListeners.push(listener);
        }
    }

    removePropertyChangedListener(listener: Function) {
        let index = this.propertyChangedListeners.indexOf(listener);
        if (index > -1) {
            this.propertyChangedListeners.splice(index, 1);
        }
    }

    emitPropertyChanged() {
        let list = this.propertyChangedListeners.slice();
        for (let listener: Function, i = 0; listener = list[i]; i++) {
            listener();
        }
    }
}