import {Graph} from 'hollyburn-util';
import {Salesforce} from 'salesforce-connect';
import {salesforceConnection} from "../../lib/helpers";

export default function handler(req, res) {

    if (req.method !== 'POST') {
        res.status(400).json({
            result: false,
            errorMessage: "unsupported method type"
        })
    }

    const {eventId} = req.body;
    if (!eventId) {
        res.status(400).json({
            result: false,
            errorMessage: "eventId is required"
        })
    }

    const {loginUrl, username, password, connectionType} = salesforceConnection();
    const salesforce = new Salesforce(connectionType, {username,password,loginUrl});

    //cancelling the event in Salesforce will cancel it via the Graph API througha APEX trigger.
    const salesforceData ={
        Cancelled__c: true,
        Calendar_Event_ID__c: eventId
    }
    salesforce.upsertSingleRecord('Event', salesforceData, 'Calendar_Event_ID__c')
        .then(data => {
            console.log(data);
            res.status(200).json({
                result: true
            })
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                result: false,
                errorMessage: error.message || "unknown internal error"
            })
        })

}