export default class ApplicationStore {

    /**
     *
     * @param {RootStore} rootStore
     */
    constructor(rootStore) {
        this.rootStore = rootStore;
    }


    /**
     * @type {number} dbMinTimer
     */
    dbMinTimer = 0;

    /**
     * Gets the db min timer
     *
     * @returns {number}
     */
    get updateDbMinTimer() {
        return this.dbMinTimer;
    };

    // Modification methods
    /**
     * Sets the update db min timer to the given value
     *
     * @param {number} dbMinTimer new value
     */
    setUpdateDbMinTimer(dbMinTimer) {
        this.dbMinTimer = dbMinTimer;
    }

    /**
     * Increments the update db min timer by the given value
     *
     * @param {number} dbMinTimer increment value
     */
    incrementUpdateDbMinTimer(dbMinTimer) {
        this.dbMinTimer += dbMinTimer;
    }

    /**
     * Increments the update db min timer by the given value
     *
     * @param {number} dbMinTimer increment value
     */
    incrementUpdateDbMinTimer() {
        this.dbMinTimer++;
    }
}