/**
 * A list of federal states of germany.
 *
 * @type {FederalState[]}
 */
germanStates = [
    new FederalState("de.bw", 'Baden-Württemberg'),
    new FederalState("de.by", 'Bayern'),
    new FederalState("de.be", 'Berlin'),
    new FederalState("de.bb", 'Brandenburg'),
    new FederalState("de.hb", 'Bremen'),
    new FederalState("de.he", 'Hessen'),
    new FederalState("de.mv", 'Mecklenburg-Vorpommern'),
    new FederalState("de.hh", 'Hamburg'),
    new FederalState("de.nd", 'Niedersachsen'),
    new FederalState("de.nw", 'Nordrhein-Westfalen'),
    new FederalState("de.rp", 'Rheinland-Pfalz'),
    new FederalState("de.sl", 'Saarland'),
    new FederalState("de.sn", 'Sachsen'),
    new FederalState("de.st", 'Sachsen-Anhalt'),
    new FederalState("de.sh", 'Schleswig-Holstein'),
    new FederalState("de.th", 'Thüringen'),
];
class FederalState {

    /**
     * A list of federal states of germany.
     *
     * @type {FederalState[]}
     */
    static get germanStates() {
        return germanStates;
    }

    /**
     *
     * @param {String} shortTerm pattern
     * @param {String} longTerm
     */
    constructor(shortTerm, longTerm) {
        this.shortTerm = shortTerm;
        this.longTerm = longTerm;
    }
}