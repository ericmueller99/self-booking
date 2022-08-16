import {Graph} from 'hollyburn-util';
import moment from "moment-timezone";

export default function handler(req, res) {

    const {eventId} = req.body;
    if (!eventId) {
        res.status(400).json({
            result: false,
            errorMessage: "invalid eventId"
        })
    }

    const graph = new Graph();
    graph.getCalendarEventDetails(eventId)
        .then(booking => {
            console.log(booking);
            if (!booking.id) {
                res.status(200).json({
                    result: false
                })
            }
            const start = moment(booking.start.dateTime + 'Z');
            const end = moment(booking.end.dateTime + 'Z');
            const response = {
                result: true,
                booking: {
                    eventId,
                    start: start.tz(booking.originalStartTimeZone).format('YYYY-MM-DDThh:mm:ss a'),
                    end: end.tz(booking.originalEndTimeZone).format('YYYY-MM-DDThh:mm:ss a'),
                    subject: booking.subject,
                    bodyPreview: booking.bodyPreview,
                }
            }
            res.status(200).json(response);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                result: false,
                errorMessage: error.message || 'Error retrieving booking'
            })
        });

}