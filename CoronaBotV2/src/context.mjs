import ApplicationStore from "./stores/applicationStore.mjs"
import path from 'path';
class RootStore {
    applicationStore;
    constructor() {
        const __dirname = path.resolve();
        console.log(__dirname);
        console.log(process.cwd());
        this.applicationStore = new ApplicationStore(this);
    }
}
export default new RootStore();