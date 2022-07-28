import {salesforceConnection} from "../../lib/helpers";
import {Salesforce} from 'salesforce-connect';
import moment from "moment";

export default function handler(req,res) {

    const {basicForm, qualifyForm, bookingForm, calendarEvent} = req.body;
    const {loginUrl, username, password, connectionType} = salesforceConnection();
    const salesforce = new Salesforce(connectionType, {username,password,loginUrl});
    const startDate = moment(calendarEvent.start.dateTime)

    const formSubmissionDetails = {

    }
    const eventDetails = {
        Calendar_Event_ID__c: calendarEvent.id,
        Subject: calendarEvent.subject,
        StartDateTime: "",
        EndDateTime: "",
        WhoId: "",
        Building__c: bookingForm.property,
        Description: calendarEvent.body.content,
        OwnerId: "",
        Scheduled_By__c: "",
        WhatId: ""
    }
    salesforce.insertSingleRecord('Event', eventDetails)
        .then(() => salesforce.insertSingleRecord('Form_Submission__c', formSubmissionDetails))
        .then(() => {

        })
        .catch(error => {
            console.log('There was an error!');
            console.log(error);
            res.status(500).json({
                result: false,
                errorMessage: error.message || 'internal system error'
            })
        })

}