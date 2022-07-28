import {Salesforce} from 'salesforce-connect';
import {salesforceConnection} from "../../lib/helpers";

export default function handler(req,res) {

    const {basicForm} = req.body;
    if (!basicForm) {
        res.status(400).json({
            result: false,
            errorMessage: "unable to update lead.  basicForm is missing from API call."
        })
    }
    const {firstName: FirstName, lastName: LastName, phoneNumber: Phone, recordType, recordId: Id} = basicForm;
    const {username, password, loginUrl, connectionType} = salesforceConnection();
    const salesforce = new Salesforce(connectionType, {username, password, loginUrl});
    salesforce.updateSingleRecord(recordType, {
        FirstName, LastName, Phone, Id
    })
        .then(data => {
            console.log('done!');
            console.log(data);
            res.status(200).json(data);
        })
        .catch(error => {
          res.status(500).json({
              result: false,
              errorMessage: error.message || 'internal system error'
          })
        })

}