
export interface IPromiseStore {
    addPromise(p: Promise<any>) : void;
    syncPendingPromises() : void;
}

export class PromiseStore implements IPromiseStore {
    private pendingPromises: Promise<any>[] = [];

    addPromise(p: Promise<any>) : void {
        this.pendingPromises.push(p);
    }

    async syncPendingPromises() : Promise<void> {
        await Promise.all(this.pendingPromises);
        this.pendingPromises = [];
    }
}
