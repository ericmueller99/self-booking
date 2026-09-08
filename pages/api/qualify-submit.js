import {hollyburnApi, apiErrorMessage} from "../../lib/hollyburn-api";

const coercePetFriendly = (value) => {
    if (value === true) {
        return true;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === 'true' || normalized === 'yes' || normalized === '1';
    }
    return false;
};

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

    const petFriendlyBool = coercePetFriendly(petFriendly);
    const occupants = parseInt(numberOfOccupants, 10);

    hollyburnApi()
        .post('/leads/qualification-form', {
            firstName,
            lastName,
            emailAddress,
            phoneNumber,
            suiteTypes,
            maxBudget,
            moveIn,
            petFriendly: petFriendlyBool,
            numberOfOccupants: Number.isFinite(occupants) ? occupants : numberOfOccupants,
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
