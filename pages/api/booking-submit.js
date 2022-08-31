import axios from "axios";
import {checkForExistingPropertyBooking} from "../../lib/helpers";

export default function handler(req,res) {

    //only accepting post requests
    if (req.method.toLowerCase() !== 'post') {
        res.status(401).send('');
        return;
    }

    const {basicForm, qualifyForm, bookingForm} = req.body;
    const {startDate, endDate, property, suites} = bookingForm;
    const {emailAddress, firstName, lastName, phoneNumber} = basicForm;

    //creates the booking
    const createBooking = () => {
        const apiKey = process.env.HOLLYBURN_API_KEY;
        if (!apiKey) {
            res.status(400).json({
                result: false,
                errorMessage: "HOLLYBURN_API_KEY env variable is not set"
            })
        }

        const bookingUrl = `https://api.hollyburn.com/properties/property/${property}/book-a-viewing`;
        // const bookingUrl = `http://localhost:3001/properties/property/${property}/book-a-viewing`
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
                    errorMessage: error?.response?.data?.errorMessage || 'Unknown error occurred.  Please try again or contact our Rental Advisor team for assistance.'
                })
            });

    }

    //making sure that an existing booking does not already exist
    checkForExistingPropertyBooking(
      qualifyForm.emailAddress ? qualifyForm.emailAddress : basicForm.emailAddress,
      bookingForm.property
    )
      .then(existingBooking => {
          if (existingBooking) {
              res.status(400).json({
                  result:false,
                  errorMessage: "You already have an existing pending booking at this property.  If you need to make changes to your existing booking please use the Manage Booking link in the email confirmation."
              });
          }
          else {
              createBooking();
          }
      })
      .catch(error => {
          console.log(error);
          res.status(500).json({
              result: false,
              errorMessage: error.message || 'internal system error'
          })
      });

}