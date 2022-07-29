import {salesforceConnection} from "../../lib/helpers";
import {Salesforce} from 'salesforce-connect';
import moment from "moment";

export default function handler(req,res) {

    const {basicForm, qualifyForm, bookingForm, calendarEvent} = req.body;
    const {loginUrl, username, password, connectionType} = salesforceConnection();
    const salesforce = new Salesforce(connectionType, {username,password,loginUrl});
    const startDate = moment(calendarEvent.start.dateTime)
    const endDate = moment(calendarEvent.start.dateTime)
    const suiteNumbers = bookingForm.suites.map(s => s.bedrooms);

    const formSubmissionDetails = {
        Lead_Source__c: 'Form Submission',
        Lead_Source_Detail__c: 'Book A Viewing',
        First_Name__c: basicForm.firstName ? basicForm.firstName : qualifyForm.firstName,
        Last_Name__c: basicForm.lastName ? basicForm.lastName : qualifyForm.lastName,
        Email: basicForm.emailAddress ? basicForm.emailAddress : qualifyForm.emailAddress,
        Phone: basicForm.phoneNumber ? basicForm.phoneNumber : qualifyForm.phoneNumber,
        Desired_Move_In_Date__c: basicForm.moveIn ? basicForm.moveIn : qualifyForm.moveIn,
        Suite_Type__c: suiteNumbers,
        Number_Of_Occupants__c: basicForm.numberOfOccupants ? basicForm.numberOfOccupants : qualifyForm.numberOfOccupants,
        Maximum_Budget__c: basicForm.maxBudget ? basicForm.maxBudget : qualifyForm.maxBudget,
        utm_campaign__c: "",
        utm_content__c: "",
        utm_Medium__c: "",
        utm_Source__c: "",
        utm_term__c: "",
        Pet_Friendly__c: "",
        City_Preference__c: basicForm.cities ? basicForm.cities : qualifyForm.cities,
        Neighbourhood__c: basicForm.neighbourhoods ? basicForm.neighbourhoods : qualifyForm.neighbourhoods,
        Calendar_Id__c: calendarEvent.id
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

    console.log(basicForm);
    console.log(qualifyForm);
    console.log(bookingForm);
    console.log(calendarEvent);

    console.log(formSubmissionDetails);
    console.log(eventDetails);

    // salesforce.insertSingleRecord('Event', eventDetails)
    //     .then(() => salesforce.insertSingleRecord('Form_Submission__c', formSubmissionDetails))
    //     .then(() => {
    //
    //     })
    //     .catch(error => {
    //         console.log('There was an error!');
    //         console.log(error);
    //         res.status(500).json({
    //             result: false,
    //             errorMessage: error.message || 'internal system error'
    //         })
    //     })

}