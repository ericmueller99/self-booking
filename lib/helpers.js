import {scroller} from "react-scroll";
import {Salesforce} from "salesforce-connect";

export function salesforceConnection() {
    if (!process.env.SALESFORCE_USERNAME || !process.env.SALESFORCE_PASSWORD || !process.env.SALESFORCE_LOGINURL || !process.env.SALESFORCE_TYPE) {
        throw new Error('Salesforce connection details are not set in env.');
    }
    const connectionType = process.env.SALESFORCE_TYPE;
    if (connectionType !== 'sandbox' && connectionType !== 'production') {
        throw new Error('Salesforce connectionType is not set to sandbox or production');
    }
    return {
        username: process.env.SALESFORCE_USERNAME,
        password: process.env.SALESFORCE_PASSWORD,
        loginUrl: process.env.SALESFORCE_LOGINURL,
        connectionType
    }
}

export const scrollToWizardTop = (event, options = {}) => {
    const {duration = 800, delay = 0, smooth = 'easeInOutQuart', stateSetter, newState} = options;
    if (event && event.preventDefault()) {
        event.preventDefault();
    }
    if (newState && stateSetter && typeof stateSetter === "function") {
        stateSetter(newState);
    }
    scroller.scrollTo('wizard-top', {
        duration,
        delay,
        smooth
    });
}

/**
 * Checks salesforce for existing bookings that are not completed yet where the property and email match the booker.
 * @param emailAddress
 * @param propertyHMY
 * @returns {Promise<unknown>}
 */
export const checkForExistingPropertyBooking = (emailAddress, propertyHMY) => {
    return new Promise((resolve,reject) => {

        const {loginUrl, username, password, connectionType} = salesforceConnection();
        const salesforce = new Salesforce(connectionType, {username,password,loginUrl});
        const query = `SELECT Id, Subject, Cancelled__c, Building__r.Property_HMY__c, Email_Address__c 
                       FROM Event 
                       WHERE StartDateTime >= TODAY AND Cancelled__c = FALSE AND Building__r.Property_HMY__c=${propertyHMY} AND Email_Address__c='${emailAddress}'`
        salesforce.getRecordsFromSOQL(query)
          .then(sfData => {
              if (sfData.length === 0) {
                  resolve(false);
              }
              else {
                  resolve(true);
              }
          })
          .catch(error => {
              console.log(error);
              //if there is some kind of error just default to true for now.
              resolve(false);
          })

    })
}