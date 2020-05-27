const KEY = require('../credential.json').private_key;
const SERVICE_ACCT_ID = require('../credential.json').client_id;
const CALENDAR_URL = `https://calendar.google.com/calendar/embed?src=${process.env.CALENDAR_ID}`;
const CALENDAR_ID = {
  'myCal' : process.env.CALENDAR_ID,
};
const TIMEZONE = 'UTC+00:00';

module.exports.calendarUrl = CALENDAR_URL;
module.exports.serviceAcctId = SERVICE_ACCT_ID;
module.exports.calendarId = CALENDAR_ID;
module.exports.key = KEY;
module.exports.timezone = TIMEZONE;