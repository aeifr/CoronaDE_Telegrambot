var url = 'https://funkeinteraktiv.b-cdn.net/current.v4.csv'
const request = require("request");
const f = require("./funktions");
var config = require("../config");
var secret = require("../secret");
const util = require('util');
var fs = require("fs");

const BundesländerKürtzel = ['de.bw','de.by','de.be','de.bb','de.hb','de.he','de.mv','de.hh','de.nd','de.nw','de.rp','de.sl','de.sn','de.st','de.sh','de.th']
const BundesländerArray = ['Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen', 'nicht-zugeordnet']

let getCorona = function getCorona() {
    return new Promise(function(resolve, reject) {
        var Output = "";
        f.log("Pushed: getCorona");
        request(url, (err, res, body) => {
            let confirmed = 0;
            let recovered = 0;
            let deaths = 0;
            var LT = fs.readFileSync('./data/last.csv');
            var LTarr = LT.toString().split(/\s+/);
            var LTarr = LTarr.toString().split(",");
            if (err) { r
                eject(err)
            }

            var bodyarr = body.split(',')
            var StandZeit = 0;
            for(var i = 0; i < bodyarr.length;i++){
                if(bodyarr[i].indexOf("de") >= 0){
                    if(bodyarr[i+1] === "null"){
                        if(bodyarr[i+2] === "Deutschland"){
                            confirmed = parseInt(bodyarr[i+12])
                            recovered = parseInt(bodyarr[i+13])
                            deaths = parseInt(bodyarr[i+14])
                            StandZeit = parseInt(bodyarr[i+10])
                        }
                    }
                }
            }
               
            var Output = {
                confirmed: confirmed,
                confirmeddiff: confirmed - LTarr[0],
                recovered: recovered,
                recovereddiff: recovered - LTarr[1],
                deaths: deaths,
                deathsdiff: deaths - LTarr[2],
                Zeit: LTarr[3], //Alter Wert des letzten Posts aus File
                ZeitStempelAlt: LTarr[4]/1000,
                ZeitStempel: StandZeit/1000 //Neuer höchster Wert der aktuellen Anfrage
                };
                fs.writeFile("./data/current.csv", confirmed + "," + recovered + "," + deaths + "," + new Date().getTime() + "," + StandZeit, (err) => {if (err) console.log(err);
                    f.log("current.csv was written...")
                    resolve(Output);
                });
        })
    })
}

let getCorona24 = function getCorona24() {
    return new Promise(function(resolve, reject) {
        var Output = "";
        f.log("Pushed: getCorona24");
        request(url, (err, res, body) => {
            let CountLänder = 0;
            let confirmed = 0;
            let recovered = 0;
            let deaths = 0;
            let Bundesländer = [];
            let BundesländerAlt = [];
            var LT = fs.readFileSync('./data/last24.csv');
            var LTarr = LT.toString().split(/\s+/);
            var LTarr = LTarr.toString().split(",");

            var BT = fs.readFileSync('./data/Bundesländer24.csv');
            var BTarr = BT.toString().split("\n");
            for(var i = 0; i < BTarr.length-1;i++){
                var BTarrFor = BTarr[i].toString().split(".");
                let temp = {
                    Bundesland: BTarrFor[0],
                    confirmed: Number(BTarrFor[1]),
                    recovered: Number(BTarrFor[2]),
                    deaths: Number(BTarrFor[3])
                }
                BundesländerAlt.push(temp);
            };
            //console.log(BundesländerAlt)
            if (err) { reject(err) }

            var bodyarr = body.split('\n')
            var tracker = 0;
            bodyarr.map((Zeile) =>{
                var Zeilerr = Zeile.split(',')
                BundesländerKürtzel.map((BundesländerKürtzelMap) =>{
                    if(Zeilerr[0].includes(BundesländerKürtzelMap)){
                        if(Zeilerr[1] === "de"){
                            if(CountLänder >= 16){
                                let temp = {
                                    Bundesland: "Unbekannter Standort",
                                    confirmed: Number(Zeilerr[13]),
                                    confirmeddiff: Number(Zeilerr[13]) - BundesländerAlt[tracker].confirmed,
                                    recovered: Number(Zeilerr[14]),
                                    recovereddiff: Number(Zeilerr[14]) - BundesländerAlt[tracker].recovered,
                                    deaths: Number(Zeilerr[15]),
                                    deathsdiff: Number(Zeilerr[15]) - BundesländerAlt[tracker].deaths
                                }
                                Bundesländer.push(temp);
                            }else{
                                let temp = {
                                    Bundesland: Zeilerr[2],
                                    confirmed: Number(Zeilerr[13]),
                                    confirmeddiff: Number(Zeilerr[13]) - BundesländerAlt[tracker].confirmed,
                                    recovered: Number(Zeilerr[14]),
                                    recovereddiff: Number(Zeilerr[14]) - BundesländerAlt[tracker].recovered,
                                    deaths: Number(Zeilerr[15]),
                                    deathsdiff: Number(Zeilerr[15]) - BundesländerAlt[tracker].deaths
                                }
                                Bundesländer.push(temp);
                            }

                                tracker++;
                                CountLänder++;
                        }
                    }
                });
            });
            var bodyarr = body.split(',')
            for(var i = 0; i < bodyarr.length;i++){
                if(bodyarr[i].indexOf("de") >= 0){
                    if(bodyarr[i+1] === "null"){
                        if(bodyarr[i+2] === "Deutschland"){
                            //console.log(i)
                            confirmed = parseInt(bodyarr[i+12])
                            recovered = parseInt(bodyarr[i+13])
                            deaths = parseInt(bodyarr[i+14])
                        }
                    }
                }
            }

            var WriteFile = "";
            Bundesländer.map((Bundesländer) =>{
                WriteFile = WriteFile + Bundesländer.Bundesland + "." + Bundesländer.confirmed + "." + Bundesländer.recovered + "." + Bundesländer.deaths + "\n";
            });

            fs.writeFile("./data/Bundesländer24.csv", WriteFile, (err) => {if (err) console.log(err);
                f.log("Bundesländer24.csv was written...")
                Bundesländer.sort((a, b) => (a.confirmed > b.confirmed) ? -1 : 1)

                var Output = {
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
    return new Promise(function(resolve, reject) {
        var LT = fs.readFileSync('./data/current.csv');
        var LTarr = LT.toString().split(/\s+/);
        var LTarr = LTarr.toString().split(",");
        
        var Output = {
            confirmed: LTarr[0],
            recovered: LTarr[1],
            deaths: LTarr[2],
            Zeit: LTarr[3],
            ZeitStempel: LTarr[4]/1000
            };
        resolve(Output);
    });
}

let getCoronaDetail = function getCoronaDetail(sort) {
    return new Promise(function(resolve, reject) {
        var CountLänder = 0;
        var Output = [];
        f.log("Pushed: getCoronaDetail");
        request(url, (err, res, body) => {
            var bodyarr = body.split('\n')
            bodyarr.map((Zeile) =>{
                var Zeilerr = Zeile.split(',')
                BundesländerKürtzel.map((BundesländerKürtzelMap) =>{
                    if(Zeilerr[0].includes(BundesländerKürtzelMap)){
                        if(Zeilerr[1] === "de"){
                            if(CountLänder >= 16){
                                var temp = {
                                    Bundesland: "Unbekannter Standort",
                                    confirmed: Number(Zeilerr[13]),
                                    recovered: Number(Zeilerr[14]),
                                    deaths: Number(Zeilerr[15])
                                }
                                Output.push(temp);
                            }else{
                                let temp = {
                                    Bundesland: Zeilerr[2],
                                    confirmed: Number(Zeilerr[13]),
                                    recovered: Number(Zeilerr[14]),
                                    deaths: Number(Zeilerr[15])
                                }
                                Output.push(temp);
                            }
                            CountLänder++;
                        }
                    }
                });
            });
            if(sort === true){Output.sort((a, b) => (a.confirmed > b.confirmed) ? -1 : 1)}
            resolve(Output);
        })
    })
}

module.exports = {
	getCorona,
    getCorona24,
    getCoronaFromFile,
    getCoronaDetail
};