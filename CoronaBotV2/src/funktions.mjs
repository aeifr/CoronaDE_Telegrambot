import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function getDateTime(date) {

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}

function log(info) {
    console.log("[" + getDateTime(new Date()) + "]" + " " + info)
}

function relativ(root) {
    const __dirname = dirname(fileURLToPath(root));
    return (rel) => join(__dirname,  rel);
}

export {
    log,
    relativ
};