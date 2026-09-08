import {checkForExistingPropertyBooking, hollyburnApi, apiErrorMessage} from "../../lib/hollyburn-api";
import {isPetFriendlyRequired} from "../../lib/form-helpers";

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
        let api;
        try {
            api = hollyburnApi();
        } catch (error) {
            res.status(400).json({
                result: false,
                errorMessage: error.message
            });
            return;
        }

        const postData = {
            startDate, endDate, bookingType: 'self',
            emailAddress, firstName, lastName, phoneNumber,
            //the inquiry this wizard session raised, so the booking attaches to it instead of
            //leaving a second, unlinked record. The API verifies it against the email/phone.
            inquiryId: qualifyForm.inquiryId || basicForm.inquiryId || null,
            preferences: {
                moveIn: basicForm.moveIn ? basicForm.moveIn : qualifyForm.moveIn,
                suiteType: qualifyForm.suiteTypes ? qualifyForm.suiteTypes.map(s => Number(s)) : basicForm.suiteTypes.map(s => Number(s)),
                maxBudget: qualifyForm.maxBudget ? qualifyForm.maxBudget : basicForm.maxBudget,
                numberOfOccupants: qualifyForm.numberOfOccupants ? qualifyForm.numberOfOccupants : basicForm.numberOfOccupants,
                petFriendly: qualifyForm.petFriendly !== undefined
                    ? isPetFriendlyRequired(qualifyForm.petFriendly)
                    : isPetFriendlyRequired(basicForm.petFriendly),
                cities: qualifyForm.cities && qualifyForm.cities.length > 0 ? qualifyForm.cities : basicForm.cities,
                neighbourhoods: qualifyForm.neighbourhoods && qualifyForm.neighbourhoods.length > 0 ? qualifyForm.neighbourhoods : basicForm.neighbourhoods,
                utmCampaign: qualifyForm.utmCampaign || basicForm.utmCampaign,
                utmSource: qualifyForm.utmSource || basicForm.utmSource,
                utmMedium: qualifyForm.utmMedium || basicForm.utmMedium,
                utmContent: qualifyForm.utmContent || basicForm.utmContent,
                utmTerm: qualifyForm.utmTerm || basicForm.utmTerm
            },
            bookingSuites: suites
        }

        api.post(`/properties/property/${property}/book-a-viewing`, postData)
            .then(response => {
                console.log('done!');
                console.log(response.data);
                res.json(response.data);
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({
                    result: false,
                    errorMessage: apiErrorMessage(error, 'Unknown error occurred.  Please try again or contact our Rental Advisor team for assistance.')
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
