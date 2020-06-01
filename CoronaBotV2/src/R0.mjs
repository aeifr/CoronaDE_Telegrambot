import download from "image-downloader";
import fs from "fs";
import {default as axios} from "axios";

const quickchart = 'https://quickchart.io/chart?';
/**
 *
 * @param {number} num
 * @returns {string|number}
 */
function round2Dec(num) {
    if (typeof num === "number") {
        return num.toFixed(2);
    }
    return Math.round(num * 100) / 100
}

/**
 * Gets the new infections per day.
 *
 * @returns {number[]} new infections per day
 */
function getNewInfections() {
    let currentIllCases = []
    let LT = fs.readFileSync('./data/TäglicheStats.csv');
    let LTarr = LT.toString().split(/\s+/);
    for (let i = LTarr.length - 2; i >= 0; i--) {
        let line = LTarr[i].toString().split(",");
        currentIllCases.push(parseInt(line[0]) - (parseInt(line[1]) + parseInt(line[2])))
    }
    let newInfections = []
    for (let i = 0; i < currentIllCases.length - 1; i++) {
        newInfections.push(currentIllCases[i] - currentIllCases[i + 1])
    }
    return newInfections;
}

/**
 * Receives a set of new infections.
 *
 * @callback valueProviderCallback
 * @param {number[]} newInfections
 */

/**
 * Gets the new infection amount per day.
 *
 * @param requiredMinLength
 * @param {valueProviderCallback} valueProviderCallback called on successful checked infections
 * @return {Promise<number>}
 */
function getR0CheckedValue(requiredMinLength, valueProviderCallback) {
    return new Promise((resolve, reject) => {
        let newInfections = getNewInfections();
        (requiredMinLength >= newInfections.length)
            ? resolve("Keine Daten")
            : resolve(round2Dec(valueProviderCallback(newInfections)));
    });
}


//Basis Formeln
//Reff(t) = (N(t)+N(t-1)+N(t-2)+N(t-3) / N(t-4)+N(t-5)+N(t-6)+N(t-7)

//Dt(4)= (N(t)+N(t-1)+N(t-2)+N(t-3)/4
//Reff(t)= Dt(4)/+N(t-4)

//Reff(t) = (N(t-3)+N(t-4)+N(t-5)+N(t-6)+N(t-7)+N(t-8)+N(t-9)) / (N(t-7)+N(t-8)+N(t-9)+N(t-10)+N(t-11)+N(t-12)+N(t-13))


/**
 * Provides a R0 value, with the now cast formula.
 *
 * @param {number} offset
 * @returns {Promise<number>}
 */
let getNowCast = offset => getR0CheckedValue(7 + offset, (newInfections =>
            (newInfections[offset]
                + newInfections[1 + offset]
                + newInfections[2 + offset]
                + newInfections[3 + offset])
            / (newInfections[4 + offset]
            + newInfections[5 + offset]
            + newInfections[6 + offset]
            + newInfections[7 + offset])
));

/**
 * Provides a R0 value, with a sensitive formula.
 *
 * @param {number} offset
 * @returns {Promise<number>}
 */
let getSensitive = offset => getR0CheckedValue(4 + offset, (newInfections => {
        let Dt = newInfections[offset]
            + newInfections[1 + offset]
            + newInfections[2 + offset]
            + newInfections[3 + offset];
        let Dt4 = Dt / 4;
        return Dt4 / newInfections[4 + offset];
    }
));

/**
 * Provides a R0 value, with a stable formula.
 *
 * @param {number} offset of days
 * @returns {Promise<number>}
 */
let getStable = offset => getR0CheckedValue(13 + offset, (newInfections =>
        (newInfections[offset]
            + newInfections[1 + offset]
            + newInfections[2 + offset]
            + newInfections[3 + offset]
            + newInfections[4 + offset]
            + newInfections[5 + offset]
            + newInfections[6 + offset])
        /
        (newInfections[4 + offset]
            + newInfections[5 + offset]
            + newInfections[6 + offset]
            + newInfections[7 + offset]
            + newInfections[8 + offset]
            + newInfections[9 + offset]
            + newInfections[10 + offset])
));

let oopt = {
    "url": 'https://quickchart.io/chart/render/f-5ab476c7-b6e2-42f4-a1d1-6fc7885fd324',
    "dest": "C:/dev/media/test.jpg"
};

/**
 * Provides an image representing a graph of ...
 *
 * @param Para
 * @returns {Promise<unknown>}
 * @constructor
 */
let GetGraph = function (Para) {
    return new Promise(function (resolve, reject) {
        let chartData = {
            "type": "line",
            "data": {
                "labels": ["Hello", "World"],
                "datasets": [{
                    "label": "Foo",
                    "data": [1, 2]
                }]
            }
        };
        let chartOptions = {
            "width": Para.resolutionX,
            "height": Para.resolutionY,
            "chart": chartData
        };
        axios.post("https://quickchart.io/chart/create", chartOptions)
            .then(response => {
                if (response.data && response.data.success === true) {
                    downloadResource(response.data.url, `${Para.path}${Para.filename}`)
                        .then(resolve)
                        .catch(reject)
                        .finally("finally download image");
                }
            })
            .catch(console.error);
    });
};

/**
 * Downloads a resource to a defined location.
 *
 * @param {string} url to fetch the resource from
 * @param {string} location to store the resource
 *
 * @returns {Promise<undefined>} with no further information
 */
async function downloadResource(url, location) {
    const writer = fs.createWriteStream(location);
    const response = await axios({
        "url": url,
        "method":'GET',
        "responseType":'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            console.log(`Dumped image to location ${location}`);
            resolve();
        });
        writer.on('error', (error) => {
            console.log(`Some error occurred during writing. ${error}`);
            reject();
        });
    });
}

let labels = "['11.05.2020','12.05.2020','13.05.2020','14.05.2020','15.05.2020','16.05.2020','17.05.2020','18.05.2020']"
let data = [];
data.push("[1,2]");
data.push("[1,2,3]");
data.push("[1,2,3,4]");

let GraphData = {
    resolutionX: '1920',
    resolutionY: '1080',
    path: '../media/graph/',
    filename: 'R0.png',
    type: 'line',
    label: labels,
    data: data
};


console.log(GraphData);
GetGraph(GraphData).then(Output => {
    console.log(Output.filename)
});

export {
    getNowCast,
    getSensitive,
    getStable
};