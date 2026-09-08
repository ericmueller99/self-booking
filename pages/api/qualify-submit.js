import {hollyburnApi, apiErrorMessage} from "../../lib/hollyburn-api";

export default function handler(req,res) {

    //only accepting post requests
    if (req.method.toLowerCase() !== 'post') {
        res.status(401).send('');
        return;
    }

    const {firstName, lastName, emailAddress, phoneNumber, suiteTypes, maxBudget, moveIn, petFriendly = false, numberOfOccupants, utmCampaign, utmSource, utmMedium, utmContent, utmTerm, cities, neighbourhoods} = req.body;
    if (!firstName || !lastName || !emailAddress || !phoneNumber || !suiteTypes || !maxBudget || !numberOfOccupants || !cities) {
        res.status(400).json({
            result: false,
            errorMessage: "required fields are missing"
        })
        return;
    }

    hollyburnApi()
        .post('/leads/qualification-form', {
            firstName,
            lastName,
            emailAddress,
            phoneNumber,
            suiteTypes,
            maxBudget,
            moveIn,
            petFriendly,
            numberOfOccupants,
            utmCampaign,
            utmSource,
            utmMedium,
            utmContent,
            utmTerm,
            cities,
            neighbourhoods,
            leadSource: 'Form Submission',
            leadSourceDetail: 'ILS Qualification'
        })
        .then(response => {
            const data = response.data || {};
            res.status(200).json({
                result: true,
                data,
                formSubmissionId: data.id || data.formSubmissionId || 'local',
                id: data.id
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                result: false,
                errorMessage: apiErrorMessage(error)
            });
        });

}
