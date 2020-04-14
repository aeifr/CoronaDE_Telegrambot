import * as request from 'request';
const {Readable} = require('stream')
var fs = require("fs"); //Debugging


var config = require("../config");
var mysql = require("mysql");
var secret = require("../secret");
import 'types/federalState';
import 'csv-reader';

const url = "https://funkeinteraktiv.b-cdn.net/current.v4.csv";
const RKIurl = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=OBJECTID&resultOffset=0&resultRecordCount=1000&cacheHint=true'
const RiskLayer = 'http://www.risklayer-explorer.com/media/data/events/Germany_20200321v2.csv'

var db = mysql.createPool({
	connectionLimit : 100,
	host: config.dbreaduserhost,
	user: config.dbreaduser,
	password: secret.dbreaduserpwd,
	database: config.database,
	charset : "utf8mb4"
});

function cleanString(input) {
	var output = "";
    for (var i=0; i<input.length; i++) {
		let charCodeAt = input.charCodeAt(i);
		if (charCodeAt <= 127 || charCodeAt === 223 || charCodeAt === 252 || charCodeAt === 228 || charCodeAt === 246 || charCodeAt === 196 || charCodeAt === 214 || charCodeAt === 220) {
            output += input.charAt(i);
        }
    }
    return output;
}

let updateDB = function() {
	return new Promise(function(resolve, reject) {
		let sqlcmdadduser = "REPLACE INTO region (TimeStamp, Bundesland, Ort, Quelle, QuelleURL, confirmed, recovered, deaths) VALUES ?";
		request(url, { json: true }, (err, res, body) => {
			if (err) { throw err; }
			db.getConnection(function(err, connection){
				let out = {
					Text: "Updated finished!",
					count: 0
				};

				let Barr = body.split("\n");
				let readableBody =
				let inputStream = Fs.createReadStream(body, 'utf8');

				for (i = 1; i < Barr.length-1 ; i++) {
					let tempBarr =  Barr[i].split(",");
					FederalState.germanStates.map((federalState) => {
						if(tempBarr[1].includes(federalState.shortTerm) && tempBarr[3].includes(federalState.longTerm)) {
							let timeTemp = tempBarr[4] === "NaN"
										   ? "123456789"
										   : tempBarr[10] / 1000;
							let source = tempBarr[15].replace(/["]/g,'',)
							let sqlcmdadduserv = [[timeTemp, tempBarr[3], tempBarr[2], source, tempBarr[16], tempBarr[12], tempBarr[13], tempBarr[14]]];
							connection.query(sqlcmdadduser, [sqlcmdadduserv], function(err, result) {
								//console.log(sqlcmdadduserv)
								if (err) {
									throw err;
								}
							});
							out.count++;
						}
					})
				}
				connection.release();
				resolve(out);
			});
		});
	});
};

let updateDBRisklayer = function() {
	return new Promise(function(resolve, reject) {
		let sqlcmdadduser = "REPLACE INTO risklayer (TimeStamp, Ort, QuelleURL, confirmed, recovered, deaths, population) VALUES ?";
		request(RiskLayer, { json: true }, (err, res, body) => {
			if (err) { throw err; }
			db.getConnection(function(err, connection){
				let out = {
					Text: "Updated finished!",
					count: 0
					};

					let Barr = body.split("\n")
					
					for (i = 1; i < Barr.length-1 ; i++) { 
						let tempBarr =  Barr[i].split(",");
						var DateTimeTemp = tempBarr[10].replace(/["]/g,'',) + tempBarr[11].replace(/["]/g,'',);
						var DateTimeTemp = DateTimeTemp.split(" ");
						var DateTemp = DateTimeTemp[0].split("-");
						var TimeTemp = DateTimeTemp[1].split(":");
						var newDate = DateTemp[0] + "/" + DateTemp[1] + "/" + DateTemp[2];

						if(tempBarr[12].includes('"')){
							var TempUrl = tempBarr[14]
						}else{
							var TempUrl = tempBarr[13]
						}

						var TimeDoneUnix = new Date(newDate).getTime() + TimeTemp[0] * 60 * 60 * 1000 + TimeTemp[1] * 60 * 1000 + 00 * 1000 + 60 * 60 * 1000;
						let sqlcmdadduserv = [[TimeDoneUnix/1000, tempBarr[2], TempUrl, tempBarr[4], tempBarr[5], tempBarr[6], tempBarr[8]]];	
						connection.query(sqlcmdadduser, [sqlcmdadduserv], function(err, result) {
							//console.log(sqlcmdadduserv)
							if (err) { throw err; }
						});			
						out.count++;
					}
					connection.release();
					resolve(out);
				});
			});
	});
};


let lookup = function(para) {
	return new Promise(function(resolve, reject) {
		if(para.table === "region"){
			if(para.mode === "LIKE"){var sqlcmd = "SELECT TimeStamp, Bundesland, Ort, Quelle, QuelleURL, confirmed, recovered, deaths FROM region where " + para.collum + " LIKE '%" + cleanString(para.lookup.trim()) + "%' LIMIT " + para.limit;}
			//if(para.mode === "EQUEL"){var sqlcmd = "SELECT Haltestellenname,VGNKennung,Ort FROM Haltestellen where " + para.collum + " ='" + para.lookup.trim() + "' LIMIT " + para.limit;}
		}
		if(para.table === "risklayer"){
			if(para.mode === "LIKE"){var sqlcmd = "SELECT TimeStamp, Ort, QuelleURL, confirmed, recovered, deaths, population FROM risklayer where " + para.collum + " LIKE '%" + cleanString(para.lookup.trim()) + "%' LIMIT " + para.limit;}
		}
		//console.log(sqlcmd)
		db.getConnection(function(err, connection){
			connection.query(sqlcmd, function(err, rows){
				if (err) { throw err; }
				connection.release();
				resolve(rows);
			});
		});
	});
}


module.exports = {
	updateDB,
	updateDBRisklayer,
	lookup
};