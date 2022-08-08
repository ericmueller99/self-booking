import {salesforceConnection} from "../../lib/helpers";
import {Salesforce} from 'salesforce-connect';

export default function handler(req,res) {

    //TODO before submitting a new form everytime check to see if the information is updated or new.  Because there is a back button on this i don't want a ton of form submissions for no reason

    //only accepting post requests
    if (req.method.toLowerCase() !== 'post') {
        res.status(401).send('');
        return;
    }

    const {firstName, lastName, emailAddress, phoneNumber, suiteTypes, maxBudget, moveIn, petFriendly, numberOfOccupants, utmCampaign, utmSource, utmMedium, utmContent, utmTerm, cities, neighbourhoods} = req.body;
    if (!firstName || !lastName || !emailAddress || !phoneNumber || !suiteTypes || !maxBudget || !numberOfOccupants || !cities) {
        res.status(400).json({
            result: false,
            errorMessage: "required fields are missing"
        })
        return;
    }

    try {
        const {username, password, loginUrl, connectionType} = salesforceConnection();
        const connection = {username, password, loginUrl}
        const salesforceData = {
            First_Name__c: firstName,
            Last_Name__c: lastName,
            Email__c: emailAddress,
            Phone__c: phoneNumber,
            Desired_Move_In_Date__c: moveIn,
            Suite_Type__c: suiteTypes.toString().replace(/,/g, ';'),
            Number_Of_Occupants__c: numberOfOccupants,
            Maximum_Budget__c: maxBudget,
            utm_campaign__c: utmCampaign ? utmCampaign : null,
            utm_content__c: utmContent ? utmContent : null,
            utm_Medium__c : utmMedium ? utmMedium : null,
            utm_Source__c: utmSource ? utmSource : null,
            utm_term__c: utmTerm ? utmTerm: null,
            Pet_Friendly__c: petFriendly === 'Yes',
            Lead_Source__c: 'Form Submission',
            Lead_Source_Detail__c: 'ILS Qualification',
            Task_Priority__c: 'High',
            City_Preference__c: cities.toString().replace(/,/g, ';'),
            Neighbourhood__c: neighbourhoods ? neighbourhoods.toString().replace(/,/g, ';') : null
        }
        const salesforce = new Salesforce(connectionType, connection);
        salesforce.insertSingleRecord('Form_Submission__c', salesforceData)
            .then((data) => {
                console.log('done!');
                console.log(data);
                res.status(200).json({
                    result: true,
                    data
                })
            })
            .catch(error => {
                console.log('error!');
                console.log(error);
                if (error instanceof Error) {
                    res.status(500).json({
                        result: false,
                        errorMessage: error.message,
                    })
                }
                else {
                    res.status(500).json({
                        result: false,
                        errorMessage: error
                    })
                }
            })
    }
    catch (error) {
        res.status(500).json({
            result: false,
            errorMessage: error.message
        })
    }

}