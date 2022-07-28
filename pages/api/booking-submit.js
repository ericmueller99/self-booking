import axios from "axios";

export default function handler(req,res) {

    //only accepting post requests
    if (req.method.toLowerCase() !== 'post') {
        res.status(401).send('');
        return;
    }

    const {basicForm, qualifyForm, bookingForm} = req.body;
    const {startDate, endDate, property, suites} = bookingForm;
    const {emailAddress, firstName, lastName, phoneNumber} = basicForm;

    const apiKey = process.env.HOLLYBURN_API_KEY;
    if (!apiKey) {
        res.status(400).json({
            result: false,
            errorMessage: "HOLLYBURN_API_KEY env variable is not set"
        })
    }

    const bookingUrl = `http://localhost:3001/properties/property/${property}/book-a-viewing`;
    const postData = {
        startDate, endDate, bookingType: 'self',
        emailAddress, firstName, lastName, phoneNumber,
        preferences: {
            moveIn: basicForm.moveIn ? basicForm.moveIn : qualifyForm.moveIn,
            suiteType: qualifyForm.suiteTypes ? qualifyForm.suiteTypes.map(s => Number(s)) : basicForm.suiteTypes.map(s => Number(s)),
            maxBudget: qualifyForm.maxBudget ? qualifyForm.maxBudget : basicForm.maxBudget
        },
        bookingSuites: suites
    }
    const config = {
        headers: {
            key: apiKey
        }
    }

    axios.post(bookingUrl, postData, config)
        .then(response => {
            console.log('done!');
            console.log(response);
            res.json(response.data);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                result: false,
                errorMessage: error.message || 'internal system error'
            })
        })

}