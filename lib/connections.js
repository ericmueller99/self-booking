import {Salesforce} from "salesforce-connect";
import {salesforceConnection} from "./helpers";
import {Graph} from "hollyburn-util";
import moment from "moment-timezone";

export function getCalendarEventFromGraph(eventId) {
    return new Promise((resolve, reject) => {
        const graph = new Graph();
        graph.getCalendarEventDetails(eventId)
            .then(booking => {
                if (!booking.id) {
                    resolve({
                        result: false,
                        booking: null
                    });
                }
                const start = moment(booking.start.dateTime + 'Z');
                const end = moment(booking.end.dateTime + 'Z');
                const currentDate = moment();
                resolve({
                    result: true,
                    booking: {
                        eventId,
                        start: start.tz(booking.originalStartTimeZone).format('YYYY-MM-DD hh:mm A'),
                        end: end.tz(booking.originalEndTimeZone).format('YYYY-MM-DD hh:mm A'),
                        subject: booking.subject,
                        bodyPreview: booking.bodyPreview,
                        location: booking.location.displayName,
                        expired: currentDate.isAfter(start)
                    }
                });
            })
            .catch(error => {

                //this means the calendar invite does not exist
                if (error.response?.status === 404 && error.response.data?.error?.code === 'ErrorItemNotFound') {
                    resolve({
                        result: false,
                        booking: null
                    });
                }

                //a different error has occured.
                console.log(error);
                reject(error);

            });

    })
}

export async function getCalendarEventFromSalesforce(manageKey) {

    const {loginUrl, username, password, connectionType} = salesforceConnection();
    const salesforce = new Salesforce(connectionType, {username,password,loginUrl});

    //getting the calendar event Id from Salesforce & then from the graphAPI
    try {
        const [sfEvent] = await salesforce.getRecordsFromSOQL(`SELECT Id, Calendar_Event_ID__c, Manage_Key__c from Event where Manage_Key__c='${manageKey}'`);
        if (!sfEvent) {
            return {
                result: false,
                booking: null
            };
        }
        return await getCalendarEventFromGraph(sfEvent.Calendar_Event_ID__c);
    }
    catch ( error ) {
        return Promise.reject(error);
    }

}