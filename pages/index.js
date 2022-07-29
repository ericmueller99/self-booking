import React from "react";
import {BasicForm, LoadingWidget, QualifyForm, BookAViewing, ThankYou} from 'hollyburn-lib';
import axios from "axios";
import '../node_modules/react-datepicker/dist/react-datepicker.css';
import {useRouter} from "next/router";

const completeBooking = async (calendarEvent, basicForm, ) => {

}

export default function Home() {

  const [basicForm, setBasicForm] = React.useState({result:false});
  const [qualifyForm, setQualifyForm] = React.useState({result:false});
  const [bookingForm, setBookingForm] = React.useState({result:false});
  const [isLoading, setIsLoading] = React.useState(false);
  const [bookingStatus, setBookingStatus] = React.useState({status: 'not booked'});
  const {query} = useRouter();
  const [vacancyId, setVacancyId] = React.useState(null);
  React.useEffect(() => {
    setVacancyId(query.vacancy_id ? query.vacancy_id : null);
  }, [query])

  //step 1 - state updates
  React.useEffect(() => {

    //if there was a match, but firstName, lastName, or PhoneNumber didnt match what the lead typed in then update Salesforce to match
    if (!basicForm.primaryFieldsMatch && basicForm.primaryFieldsMatch === false && basicForm.recordType) {
      console.log('updating leads firstName, lastName, and phone to match');
      setBasicForm({
        ...basicForm,
        primaryFieldsMatch: true
      })
      //updating Salesforce with the new firstName, lastName, and phoneNumber
      axios.post('/api/update-lead', {basicForm})
          .catch(error => {
            console.log('Unable to update lead from basicForm.  Salesforce returned an error.');
            console.log(error);
          })
    }

    //if the form is not complete yet then do not proceed
    if (!basicForm.result) {
      return;
    }
    //if the check is already complete the do not re-check
    if (basicForm.checkComplete) {
      return;
    }

    //show loading window.
    setIsLoading(true);

    //submitting the step 1 wizard to the handler.  This will check if the user is qualified already in Salesforce and return the data.
    axios.post('/api/basic-submit', basicForm)
        .then(res => {
          console.log(res);
          const {FirstName: firstName, LastName: lastName, Email: emailAddress, Phone: phoneNumber, isQualified, invalidFields, Preference__c: preferences = {}, recordType, Id: recordId} = res.data;
          const {Suite_Type__c: suiteTypes, Maximum_Budget__c: maxBudget, Desired_Move_In_Date__c: moveIn, Number_of_Occupants__c: numberOfOccupants, City__c: cities,
            Neighbourhood__c: neighbourhoods} = preferences;
          const primaryFieldsMatch = (firstName === basicForm.firstName  && lastName === basicForm.lastName && phoneNumber === basicForm.phoneNumber);
          console.log(isQualified);
          setBasicForm({
            ...basicForm,
            checkComplete: true,
            isQualified: isQualified ? isQualified : false,
            recordType, recordId,
            //taking the basic information from step 1
            firstName: basicForm.firstName,
            lastName: basicForm.lastName,
            emailAddress: emailAddress ? emailAddress : basicForm.emailAddress,
            phoneNumber: basicForm.phoneNumber,
            invalidFields,
            suiteTypes: suiteTypes ? suiteTypes.split(';') : [], maxBudget, numberOfOccupants,
            cities: cities ? cities.split(';') : [],
            neighbourhoods: neighbourhoods ? neighbourhoods.split(';') : [],
            moveIn: moveIn ? new Date(moveIn) : null,
            primaryFieldsMatch
          })
          setIsLoading(false);
        })
        .catch(error => {
          console.log(error);
          setIsLoading(false);
        });

  }, [basicForm]);

  //step 2 - qualification form updated
  React.useEffect(() => {

    if (qualifyForm.qualifyComplete) {
      return;
    }

    const {formSubmissionId} = qualifyForm;
    if (formSubmissionId) {
      setQualifyForm({
        ...qualifyForm,
        qualifyComplete: true,
      })
      if (!basicForm.isQualified) {
        setBasicForm({
          ...basicForm,
          isQualified: true
        })
      }
    }

  }, [qualifyForm]);

  //step 3 - booking form updated
  React.useEffect(() => {

    //stop if any of these are true.
    if (!bookingForm.result) {
      return;
    }
    if (bookingStatus.status === 'pending' || bookingStatus.status === 'booked') {
      return;
    }

    //update loading and booking states.
    setIsLoading(true);
    setBookingStatus({status: 'pending'});

    //submitting the the calendar event to the api via a local proxy endpoint
    let postData = {
      basicForm, qualifyForm, bookingForm
    }
    axios.post('/api/booking-submit')
        .then(res => {
          if (!res.data && !res.data.id) {
            throw new Error('/api/booking-submit returned 200, but no calendar id was found');
          }
          const calendarEvent = res.data;
          postData = {...postData, calendarEvent}
        })
        .then(() => axios.post('/api/booking-completed', postData))
        .then(() => {
          setBookingStatus({status: 'booked', eventId: id});
          setIsLoading(false);
        })
        .catch(error => {
          console.log('there was an error completing the booking');
          console.log(error);
          setIsLoading(false);
          setBookingStatus({status:'error'});
        });

  },[bookingForm]);

  //back button handlers.
  const handleQualifyBack = (event) => {
    event.preventDefault();
    setBasicForm({
      ...basicForm,
      result: false
    })
  }
  const handleBookBack = (event) => {
    event.preventDefault();
    if (!qualifyForm.result) {
      setBasicForm({
        ...basicForm,
        result: false
      })
    }
    else {
      setQualifyForm({
        ...qualifyForm,
        result: false
      })
    }
  }
  const handlePrefsUpdate = (event) => {
    event.preventDefault();
    //basicForm.checkComplete && basicForm.result && basicForm.isQualified
    setBasicForm({
      ...basicForm,
      checkComplete: true,
      result: true,
      isQualified: false,
    });
    setQualifyForm({
      ...qualifyForm,
      result: false
    })
    console.log('hello');
  }

  //wizard display logic.
  const Wizard = () => {

    //options logic for BookAViewing Component
    const bookAViewingOptions = {
      buttonText: 'Book Viewing',
      showBack: true,
      handleBackButton: handleBookBack,
      showUpdatePrefsBanner: true,
      handleUpdatePrefs: handlePrefsUpdate,
      preferences: {
        ...basicForm,
        ...qualifyForm
      }
    }

    if (!basicForm.result) {
      const options = {
        buttonText: 'Next'
      }
      return <BasicForm stateSetter={setBasicForm} options={options} {...basicForm} />
    }
    //basic form is complete, but the lead is not qualified.  Show the qualification form
    else if (basicForm.checkComplete && basicForm.result && !basicForm.isQualified && !qualifyForm.result) {
      const options = {
        buttonText: 'Next',
        showBack: true,
        handleBackButton: handleQualifyBack,
        submitUrl: '/api/qualify-submit'
      }

      //too take the preferences from the qualify form first incase they press back.
      const preferences = {
        ...basicForm,
        ...qualifyForm,
      }

      return <QualifyForm options={options} {...preferences} stateSetter={setQualifyForm} />
    }
    //basic form is complete and user is qualified already.  Show the book a viewing form.
    else if (basicForm.checkComplete && basicForm.result && basicForm.isQualified) {
      return <BookAViewing options={bookAViewingOptions} stateSetter={setBookingForm} vacancyId={vacancyId} />
    }
    //basic and qualify form are completed.  show book a viewing form
    else if (basicForm.checkComplete && qualifyForm.result && qualifyForm.qualifyComplete) {
      return <BookAViewing options={bookAViewingOptions} stateSetter={setBookingForm} vacancyId={vacancyId} />
    }
    //loading and nothing else is going on
    else if (isLoading) {
      return (
          <div className={"p-10 h-48"}></div>
      )
    }
    //wizard is completed and the unit is booked
    else if (bookingStatus.status === 'booked') {
      return <ThankYou />
    }
    //some unexepcted state happend.
    else {
      return <div className={"p-10"}>Render something here!</div>
    }
  }

  return (
      <main>
        <div className={"bg-gray-100"}>
          <div className={"max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8"}>
            <div className={"relative bg-white shadow-xl"}>
              <LoadingWidget isLoading={isLoading} />
              <div className={"grid grid-cols-1"}>
                <Wizard />
              </div>
            </div>
          </div>
        </div>
      </main>
  )

}