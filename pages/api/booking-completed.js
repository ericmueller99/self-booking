import {salesforceConnection} from "../../lib/helpers";
import {Salesforce} from 'salesforce-connect';
import moment from "moment-timezone";

export default function handler(req,res) {

    const {basicForm, qualifyForm, bookingForm, calendarEvent} = req.body;
    const {loginUrl, username, password, connectionType} = salesforceConnection();
    const salesforce = new Salesforce(connectionType, {username,password,loginUrl});
    const startDate = moment.tz(calendarEvent.start.dateTime.split(".")[0], calendarEvent.start.timeZone).utc().format();
    const endDate = moment.tz(calendarEvent.end.dateTime.split(".")[0], calendarEvent.end.timeZone).utc().format();
    const suiteNumbers = bookingForm.suites.map(s => s.bedrooms);
    const vacancyIds = bookingForm.suites.map(s => s.vacancyId);

    //I cant get any of the activity fields to work from here.  Instead they are submitted to the Form and the APEX trigger handles updating the calendar event
    const eventDetails = {
        Calendar_Event_ID__c: calendarEvent.id,
        Subject: calendarEvent.subject,
        StartDateTime: startDate,
        EndDateTime: endDate,
        WhoId: basicForm.recordId ? basicForm.recordId : null,
        Description: calendarEvent.body.content,
    }
    const formSubmissionDetails = {
        Lead_Source__c: 'Form Submission',
        Lead_Source_Detail__c: 'Book A Viewing',
        First_Name__c: basicForm.firstName ? basicForm.firstName : qualifyForm.firstName,
        Last_Name__c: basicForm.lastName ? basicForm.lastName : qualifyForm.lastName,
        Email__c: basicForm.emailAddress ? basicForm.emailAddress : qualifyForm.emailAddress,
        Phone__c: basicForm.phoneNumber ? basicForm.phoneNumber : qualifyForm.phoneNumber,
        Desired_Move_In_Date__c: qualifyForm.moveIn ? qualifyForm.moveIn : basicForm.moveIn,
        Suite_Type__c: suiteNumbers.join(';'),
        Number_Of_Occupants__c: qualifyForm.numberOfOccupants ? qualifyForm.numberOfOccupants : basicForm.numberOfOccupants,
        Maximum_Budget__c: qualifyForm.maxBudget ? qualifyForm.maxBudget : basicForm.maxBudget,
        Pet_Friendly__c: qualifyForm.petFriendly ? true : !!basicForm.petFriendly,
        City_Preference__c: qualifyForm.cities && qualifyForm.cities.length > 0 ? qualifyForm.cities.join(';') : basicForm.cities && basicForm.cities.length > 0 ? basicForm.cities.join(';') : null,
        Neighbourhood__c: qualifyForm.neighbourhoods && qualifyForm.length > 0 ? qualifyForm.neighbourhoods.join(';') :
            basicForm.neighbourhoods && basicForm.neighbourhoods.length > 0 ? basicForm.neighbourhoods.join(';') : null,
        Calendar_Id__c: calendarEvent.id,
        Related_Vacancy_Ids__c: vacancyIds.join(';'),
        Converts_Lead__c: true,
        Property_HMY__c: bookingForm.property
    }

    //the form APEX trigger performs some actions on the calendar event, so it needs to be created first.
    salesforce.insertSingleRecord('Event', eventDetails)
        .then(() => salesforce.insertSingleRecord('Form_Submission__c', formSubmissionDetails))
        .then((formRes) => {
            console.log('done!');
            console.log(formRes);
            res.status(200).json({
                result: true
            })
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                result: false,
                errorMessage: error.message || 'unknown internal error'
            })
        })

}