const dateFormatOptions = {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit'
};
const dateTimeFormat = new Intl.DateTimeFormat('de', dateFormatOptions);

/**
 *
 * @param {Date} date
 * @returns {string}
 */
function getDateTime(date) {
	return dateTimeFormat.format(date);
}

var log = function(){

	// 1. Convert args to a normal array
	var args = Array.prototype.slice.call(arguments);

	// 2. Prepend log prefix log string
	args.unshift("[" + getDateTime(new Date()) + "]" + " ");

	// 3. Pass along arguments to console.log
	console.log.apply(console, args);
}

module.exports = {
	log
};