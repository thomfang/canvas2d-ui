import { Utility } from './Utility';

export class WeakRef {

    private static weakRefTable: { [uid: string]: { [ref: string]: any } } = {};

    public static set(ref: string, source: any, target: any) {
        let uid = Utility.getUid(source);
        if (!this.weakRefTable[uid]) {
            this.weakRefTable[uid] = {};
        }
        if (this.weakRefTable[uid][ref] != null) {
            Utility.warn(`Reference "${ref}" target is override`, target, "Source:", source);
        }
        this.weakRefTable[uid][ref] = target;
    }

    public static get(ref: string, source: any) {
        let uid = Utility.getUid(source);
        return this.weakRefTable[uid] && this.weakRefTable[uid][ref];
    }

    public static remove(ref: string, source: any) {
        let uid = Utility.getUid(source);
        let table = this.weakRefTable[uid];
        if (table) {
            delete table[ref];
            if (Object.keys(table).length === 0) {
                delete this.weakRefTable[uid];
            }
        }
    }

    public static clear(source: any) {
        delete this.weakRefTable[Utility.getUid(source)];
    }
}