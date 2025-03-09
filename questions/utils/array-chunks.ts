declare global {
    interface Array<T> {
        /*
         * Return an array, containing the elements of this
         * array, split into n chunks
         **/
        chunks(n: number) : Array<Array<T>>;
    }
}

export function chunks<T>(this: Array<T>, n: number) : Array<Array<T>> {
    return this.filter((_,i) => i % n === 0).map((_,i) => this.slice(i,i+n))
}

Array.prototype.chunks = chunks;
