export class opId {
    currentId: number;
    constructor() {
        this.currentId = 0;
    }
    getId() {
        return this.currentId++
    }
}