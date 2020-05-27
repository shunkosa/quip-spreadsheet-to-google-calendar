const quip = require('./quip');
const tableToJson = require('tabletojson').Tabletojson;
const googleCalendar = require('node-google-calendar');

const SINGLE_EVENT_ID_PREFIX = 'ssfv';
const RECURRING_EVENT_ID_PREFIX = 'rsfv';

require('dotenv').config();

const googleCalendarConfig = require('./config');
const calendarClient = new googleCalendar(googleCalendarConfig);
const myCalendar = googleCalendarConfig.calendarId.myCal;

const quipClient = new quip.Client({ accessToken: process.env.QUIP_ACCESS_TOKEN });
quipClient.getThread(process.env.QUIP_THREAD_ID, (error, result) => {
    if (error) {
        console.log('Error getting the quip thread');
    }
    const html = result.html;
    const converted = tableToJson.convert(html);
    // converted[0] is the scheduled event table;
    
    converted[0].forEach((row, index) => {
        if (index === 0) {
            return true; 
        }
        if (isEmptyRow(row)) {
            return false;
        }
        const eventId = `${SINGLE_EVENT_ID_PREFIX}${row.A}`;
        const event = {
            'id': eventId,
            'start':  {'dateTime': buildStartDateTime(row) },
            'end': {'dateTime': buildEndDateTime(row) },
            'summary': row.B,
            'description': `${row.D}\n\nURL:${row.E}\nOrganizer:${row.C}`,
        };
        const newEvent = {
            'id': eventId,
            ...event
        };
        
        /*
        calendarClient.Events.get(myCalendar, eventId, {})
            .then(result => {
                console.log(`${eventId}: ` + result);
            })
            .catch(error => {
                console.log(`${eventId}: ` + error);
            });
        
        */
        calendarClient.Events.insert(myCalendar, newEvent)
            .then(result => {
                console.log(`${eventId}: inserted.`);
            })
            .catch(err => {
                console.log(`ERROR ${eventId}: ${JSON.stringify(err.message)}`);
            });
        
    }); 

})

const buildStartDateTime = (row) => {
    const startDate = formatDate(row.F);
    const startTime = formatTime(row.G);
    const offset = TimezoneOffset[row.I] ? TimezoneOffset[row.I] : '+00:00';
    return `${startDate}T${startTime}${offset}`;
};

const buildEndDateTime = (row) => {
    const endDate = formatDate(row.F);
    const endHour = row.H.length > 1 ? row.H.split(':')[0].padStart(2, '0') : String(Number(row.G.split(':')[0]) + 2).padStart(2, '0');
    const endMinute = row.H.length > 1 ? row.H.split(':')[1].padStart(2, '0') : row.G.split(':')[1];
    const offset = TimezoneOffset[row.I] ? TimezoneOffset[row.I] : '+00:00';
    return `${endDate}T${endHour}:${endMinute}:00${offset}`;
}

const TimezoneOffset = {
    'EST': '-05:00',
    'CDT': '-06:00',
    'PDT': '-07:00',
    'PST': '-08:00',
    'CET': '+01:00',
    'BST': '+01:00',
    'IST': '+05:30',
    'NZST': '+12:00'
};

// MM/DD/YYYY to YYYY-MM-DD
const formatDate = (dateString) => {
    return `${dateString.split('/')[2]}-${dateString.split('/')[0].padStart(2, '0')}-${dateString.split('/')[1].padStart(2, '0')}`;
}

// H:MM to HH:MM:00
const formatTime = (timeString) => {
    return `${timeString.split(':')[0].padStart(2, '0')}:${timeString.split(':')[1].padStart(2, '0')}:00`;
}

const isEmptyRow = (row) => {
    let result = false;
    if (!row.A) {
        return result;
    }
    for (const col of ['B','C','D','E','F','G']) {
        result = result || (!row[col] || row[col].length <= 1);
    }
    return result;
}