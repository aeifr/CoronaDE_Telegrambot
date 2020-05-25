var url = 'https://funkeinteraktiv.b-cdn.net/current.v4.csv'
import request from "request";
import * as f from "./funktions.mjs";
import fs from "fs";

let relativPath = f.relativ(import.meta.url);

let ErsteZeile = "";
const BundesländerKürtzel = ['de.bw', 'de.by', 'de.be', 'de.bb', 'de.hb', 'de.he', 'de.mv', 'de.hh', 'de.nd', 'de.nw', 'de.rp', 'de.sl', 'de.sn', 'de.st', 'de.sh', 'de.th']
const BundesländerArray = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen', 'nicht-zugeordnet']

function GetCSVPosition(KeyString) {
    return ErsteZeile.split(',').indexOf(KeyString);
}

let getCorona = function getCorona() {
    return new Promise(function (resolve, reject) {
        f.log("Pushed: getCorona");
        request(url, (err, res, body) => {
            if (err) {
                reject(err)
            }
            let confirmed = 0;
            let recovered = 0;
            let deaths = 0;
            let lastPath = relativPath("../data/last.csv");
            let LT = fs.readFileSync(lastPath);
            let LTarr = LT.toString().split(/\s+/);
            LTarr = LTarr.toString().split(",");

            let bodyarr = body.split(',')
            let bodyarrZeilen = body.split('\n')
            ErsteZeile = bodyarrZeilen[0]
            let StandZeit = 0;
            for (let i = 0; i < bodyarr.length; i++) {
                if (bodyarr[i].indexOf("de") >= 0) {
                    if (bodyarr[i + 1] === "null") {
                        if (bodyarr[i + 2] === "Deutschland") {
                            confirmed = parseInt(bodyarr[i + GetCSVPosition("confirmed")])
                            recovered = parseInt(bodyarr[i + GetCSVPosition("recovered")])
                            deaths = parseInt(bodyarr[i + GetCSVPosition("deaths")])
                            StandZeit = parseInt(bodyarr[i + GetCSVPosition("updated")])
                        }
                    }
                }
            }

            let output = {
                confirmed: confirmed,
                confirmeddiff: confirmed - LTarr[0],
                recovered: recovered,
                recovereddiff: recovered - LTarr[1],
                deaths: deaths,
                deathsdiff: deaths - LTarr[2],
                krankealt: LTarr[3],
                Zeit: LTarr[4], //Alter Wert des letzten Posts aus File
                ZeitStempelAlt: LTarr[5] / 1000,
                ZeitStempel: StandZeit / 1000 //Neuer höchster Wert der aktuellen Anfrage
            };
            fs.writeFile(relativPath("../data/current.csv"), confirmed + "," + recovered + "," + deaths + "," + new Date().getTime() + "," + StandZeit, (err) => {
                if (err) {
                    console.log(err);
                }
                f.log("current.csv was written...")
                resolve(output);
            });
        })
    })
}

let getCorona24 = function getCorona24() {
    return new Promise(function (resolve, reject) {
        let output = "";
        f.log("Pushed: getCorona24");
        request(url, (err, res, body) => {
            let bodyarrZeilen = body.split('\n')
            ErsteZeile = bodyarrZeilen[0]
            let CountLänder = 0;
            let confirmed = 0;
            let recovered = 0;
            let deaths = 0;
            let Bundesländer = [];
            let BundesländerAlt = [];
            let LT = fs.readFileSync('./data/last24.csv');
            let LTarr = LT.toString().split(/\s+/);
            LTarr = LTarr.toString().split(",");

            let BT = fs.readFileSync('./data/Bundesländer24.csv');
            let BTarr = BT.toString().split("\n");
            for (let i = 0; i < BTarr.length - 1; i++) {
                let BTarrFor = BTarr[i].toString().split(".");
                let temp = {
                    Bundesland: BTarrFor[0],
                    confirmed: Number(BTarrFor[1]),
                    recovered: Number(BTarrFor[2]),
                    deaths: Number(BTarrFor[3])
                }
                BundesländerAlt.push(temp);
            }
            //console.log(BundesländerAlt)
            if (err) {
                reject(err)
            }

            let bodyarr = body.split('\n')
            let tracker = 0;
            bodyarr.map((Zeile) => {
                let Zeilerr = Zeile.split(',')
                BundesländerKürtzel.map((BundesländerKürtzelMap) => {
                    if (Zeilerr[0].includes(BundesländerKürtzelMap)) {
                        if (Zeilerr[1] === "de") {
                            if (CountLänder >= 16) {
                                let temp = {
                                    Bundesland: "Unbekannter Standort",
                                    confirmed: Number(Zeilerr[1 + GetCSVPosition("confirmed")]),
                                    confirmeddiff: Number(Zeilerr[1 + GetCSVPosition("confirmed")]) - BundesländerAlt[tracker].confirmed,
                                    recovered: Number(Zeilerr[1 + GetCSVPosition("recovered")]),
                                    recovereddiff: Number(Zeilerr[1 + GetCSVPosition("recovered")]) - BundesländerAlt[tracker].recovered,
                                    deaths: Number(Zeilerr[1 + GetCSVPosition("deaths")]),
                                    deathsdiff: Number(Zeilerr[1 + GetCSVPosition("deaths")]) - BundesländerAlt[tracker].deaths
                                }
                                Bundesländer.push(temp);
                            } else {
                                let temp = {
                                    Bundesland: Zeilerr[GetCSVPosition("label")],
                                    confirmed: Number(Zeilerr[1 + GetCSVPosition("confirmed")]),
                                    confirmeddiff: Number(Zeilerr[1 + GetCSVPosition("confirmed")]) - BundesländerAlt[tracker].confirmed,
                                    recovered: Number(Zeilerr[1 + GetCSVPosition("recovered")]),
                                    recovereddiff: Number(Zeilerr[1 + GetCSVPosition("recovered")]) - BundesländerAlt[tracker].recovered,
                                    deaths: Number(Zeilerr[1 + GetCSVPosition("deaths")]),
                                    deathsdiff: Number(Zeilerr[1 + GetCSVPosition("deaths")]) - BundesländerAlt[tracker].deaths
                                }
                                Bundesländer.push(temp);
                            }

                            tracker++;
                            CountLänder++;
                        }
                    }
                });
            });
            bodyarr = body.split(',')
            for (var i = 0; i < bodyarr.length; i++) {
                if (bodyarr[i].indexOf("de") >= 0) {
                    if (bodyarr[i + 1] === "null") {
                        if (bodyarr[i + 2] === "Deutschland") {
                            //console.log(i)
                            confirmed = parseInt(bodyarr[i + GetCSVPosition("confirmed")])
                            recovered = parseInt(bodyarr[i + GetCSVPosition("recovered")])
                            deaths = parseInt(bodyarr[i + GetCSVPosition("deaths")])
                        }
                    }
                }
            }

            let writeFile = "";
            Bundesländer.map((Bundesländer) => {
                writeFile = writeFile + Bundesländer.Bundesland + "." + Bundesländer.confirmed + "." + Bundesländer.recovered + "." + Bundesländer.deaths + "\n";
            });

            fs.writeFile("./data/Bundesländer24.csv", writeFile, (err) => {
                if (err) console.log(err);
                f.log("Bundesländer24.csv was written...")
                Bundesländer.sort((a, b) => (a.confirmed > b.confirmed) ? -1 : 1)

                let Output = {
                    confirmed: confirmed,
                    confirmeddiff: confirmed - LTarr[0],
                    recovered: recovered,
                    recovereddiff: recovered - LTarr[1],
                    deaths: deaths,
                    deathsdiff: deaths - LTarr[2],
                    Zeit: LTarr[3],
                    Bundesländer: Bundesländer
                };

                resolve(Output);
            });
        })
    })
}

let getCoronaFromFile = function getCoronaFromFile() {
    return new Promise(function (resolve, reject) {
        let LT = fs.readFileSync(relativPath('../data/current.csv'));
        let LTarr = LT.toString().split(/\s+/);
        LTarr = LTarr.toString().split(",");

        resolve({
            confirmed: LTarr[0],
            recovered: LTarr[1],
            deaths: LTarr[2],
            Zeit: LTarr[3],
            ZeitStempel: LTarr[4] / 1000
        });
    });
}

let getCoronaDetail = function getCoronaDetail(sort) {
    return new Promise(function (resolve, reject) {
        let CountLänder = 0;
        let output = [];
        f.log("Pushed: getCoronaDetail");
        request(url, (err, res, body) => {
            let bodyarrZeilen = body.split('\n')
            ErsteZeile = bodyarrZeilen[0]
            let bodyarr = body.split('\n')
            bodyarr.map((Zeile) => {
                let Zeilerr = Zeile.split(',')
                BundesländerKürtzel.map((BundesländerKürtzelMap) => {
                    if (Zeilerr[0].includes(BundesländerKürtzelMap)) {
                        if (Zeilerr[1] === "de") {
                            if (CountLänder >= 16) {
                                let temp = {
                                    Bundesland: "Unbekannter Standort",
                                    confirmed: Number(Zeilerr[1 + GetCSVPosition("confirmed")]),
                                    recovered: Number(Zeilerr[1 + GetCSVPosition("recovered")]),
                                    deaths: Number(Zeilerr[1 + GetCSVPosition("deaths")])
                                }
                                output.push(temp);
                            } else {
                                let temp = {
                                    Bundesland: Zeilerr[GetCSVPosition("label")],
                                    confirmed: Number(Zeilerr[1 + GetCSVPosition("confirmed")]),
                                    recovered: Number(Zeilerr[1 + GetCSVPosition("recovered")]),
                                    deaths: Number(Zeilerr[1 + GetCSVPosition("deaths")])
                                }
                                output.push(temp);
                            }
                            CountLänder++;
                        }
                    }
                });
            });
            if (sort === true) {
                output.sort((a, b) => (a.confirmed > b.confirmed) ? -1 : 1)
            }
            resolve(output);
        })
    })
}

export {
    getCorona,
    getCorona24,
    getCoronaFromFile,
    getCoronaDetail
};