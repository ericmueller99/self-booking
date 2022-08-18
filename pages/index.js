import React from "react";
import {BasicForm, LoadingWidget, QualifyForm, BookAViewing, ThankYou} from 'hollyburn-lib';
import axios from "axios";
import '../node_modules/react-datepicker/dist/react-datepicker.css';
import {useRouter} from "next/router";
import {Element, scroller, animateScroll as scroll} from 'react-scroll'
import {XCircleIcon} from "@heroicons/react/solid";
import {scrollToWizardTop} from "../lib/helpers";
import NeedAssistance from "./components/NeedAssistance";
import HeroImage from "./components/HeroImage";

export default function Home() {

  const [basicForm, setBasicForm] = React.useState({result:false});
  const [qualifyForm, setQualifyForm] = React.useState({result:false});
  const [bookingForm, setBookingForm] = React.useState({result:false});
  const [isLoading, setIsLoading] = React.useState(false);
  const [bookingStatus, setBookingStatus] = React.useState({status: 'not booked'});
  const {query} = useRouter();
  const [vacancyId, setVacancyId] = React.useState(null);
  const [currentView, setCurrentView] = React.useState(null);
  const [error, setError] = React.useState({error: false, errorMessage: null})
  React.useEffect(() => {
    setVacancyId(query.vacancy_id ? query.vacancy_id : null);
  }, [query])
  const [wizardImg, setWizardImg] = React.useState('wizard1.jpg');

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
          const {FirstName: firstName, LastName: lastName, Email: emailAddress, Phone: phoneNumber, isQualified, invalidFields, Preference__c: preferences = {}, recordType, Id: recordId} = res.data;
          const {Suite_Type__c: suiteTypes, Maximum_Budget__c: maxBudget, Desired_Move_In_Date__c: moveIn, Number_of_Occupants__c: numberOfOccupants, City__c: cities,
            Neighbourhood__c: neighbourhoods, Pet_Friendly__c: petFriendly = false} = preferences || {};
          const primaryFieldsMatch = (firstName === basicForm.firstName  && lastName === basicForm.lastName && phoneNumber === basicForm.phoneNumber);
          //if the qualifyForm is completed the reset it and let the new submission determine.
          if (qualifyForm.result) {
            setQualifyForm({result: false})
          }
          //if view is being manually set cancel it
          if (currentView) {
            setCurrentView(null);
          }
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
            petFriendly,
            primaryFieldsMatch
          })
          //if the qualification form is already setup then reset it
          setIsLoading(false);
          setError({error:false})
            if (isQualified) {
                setWizardImg('wizard3.jpg');
            }
            else {
                setWizardImg('wizard2.jpg');
            }
            scrollToWizardTop();
        })
        .catch(error => {
          console.log(error);
          setBasicForm({... basicForm, result: false})
            setError({
                error: true,
                errorMessage: error.response?.data?.errorMessage || "There was an error.  Please ensure the email address entered is valid and does not contain any special characters."
            })
          setIsLoading(false);
          scrollToWizardTop();
        });

  }, [basicForm]);

  //step 2 - qualification form updated
  React.useEffect(() => {

    if (qualifyForm.qualifyComplete) {
      return;
    }

    const {formSubmissionId} = qualifyForm;
    if (formSubmissionId) {
      //if the view is being manually set remove it
      if (currentView) {
        setCurrentView(null);
      }
      setWizardImg('wizard3.jpg');
      setQualifyForm({
        ...qualifyForm,
        qualifyComplete: true,
      })
      //if the basic form showed not qualified, now make them qualified based on the new submission.
      if (!basicForm.isQualified) {
        setBasicForm({
          ...basicForm,
          isQualified: true
        })
      }
      scrollToWizardTop();
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
    setError({error: false})

    //submitting the the calendar event to the api via a local proxy endpoint
    let postData = {
      basicForm, qualifyForm, bookingForm
    }
    axios.post('/api/booking-submit', postData)
        .then(res => {
          if (!res.data && !res.data.id) {
            throw new Error('/api/booking-submit returned 200, but no calendar id was found');
          }
          const calendarEvent = res.data;
          postData = {...postData, calendarEvent}
        })
        .then(() => axios.post('/api/booking-completed', postData))
        .then(() => {
          setBookingStatus({status: 'booked'});
          setIsLoading(false);
          scrollToTop();
        })
        .catch(error => {
          console.log('there was an error completing the booking');
          console.log(error);
          setIsLoading(false);
          setBookingStatus({status:'error'});
          setError({
            error: true,
            errorMessage: error.response?.data?.errorMessage || 'Error creating booking.  Please try again.'
          });
          scrollToWizardTop();
        });

  },[bookingForm]);

  //back button handlers.
  const handleQualifyBack = (event) => {
      if (event && event.preventDefault()) {
          event.preventDefault();
      }
    setCurrentView('basic');
    setWizardImg('wizard1.jpg');
    scrollToWizardTop();
  }
  const handleBookBack = (event) => {
      if (event && event.preventDefault()) {
          event.preventDefault();
      }
    if (qualifyForm.qualifyComplete) {
      setCurrentView('qualify')
        setWizardImg('wizard2.jpg');
    }
    else {
      setCurrentView('basic');
      setWizardImg('wizard1.jpg');
    }
    scrollToWizardTop();
  }
  const handlePrefsUpdate = (event) => {
    event.preventDefault();
    setCurrentView('qualify');
    setWizardImg('wizard2.jpg');
    scrollToWizardTop();
  }
  const resetForm = (event) => {
    event.preventDefault();
    setBookingForm({result:false});
    setQualifyForm({result:false});
    setBasicForm({resetForm: false});
    setCurrentView(null);
    setBookingStatus({status: 'not booked'});
    setWizardImg('wizard1.jpg');
  }
  const scrollToTop = (event) => {
    if (event && event.preventDefault()) {
      event.preventDefault();
    }
    scroll.scrollToTop();
  }
  const WizardContent = ({title, descriptionText, disclaimerText}) => {
    return (
      <>
        <div className="max-w-md mx-auto sm:max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-gray-500 sm:mt-3">
            {descriptionText}
          </p>
        </div>
        {
          disclaimerText &&
          <div className="mx-auto mt-4">
            <p className="text-xs text-hbBlue">
              {disclaimerText}
            </p>
          </div>
        }
      </>
    )
  }
  const ErrorMessage = ({errorMessage}) => {
      return (
          <div className="col-span-2 mt-4">
              <div className="rounded-md bg-red-400 p-4">
                  <div className="flex">
                      <div className="flex-shrink-0 items-center flex">
                          <XCircleIcon className="h-7 w-7 text-white" aria-hidden="true" />
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between text-center">
                          <p className={"text-white"}>{errorMessage || error.errorMessage}</p>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  //wizard display logic.
  const Wizard = () => {

    //basic form options
    const basicOptions = {
      buttonText: 'Next',
      formHolderClasses: 'none',
      formClasses: 'mt-9 grid grid-cols-1 lg:grid-cols-2 gap-y-6 sm:gap-x-8',
      textInputHolderClasses: 'col-span-2 lg:col-span-1',
      title: 'Basic Information',
      descriptionText: 'Please enter your basic information so that we can see if you exist in our system already'
    }

    //preferences using qualify first.
    const preferences = {
      ...basicForm,
      ...qualifyForm,
    }

    //qualify form options
    const qualifyOptions = {
      buttonText: 'Next',
      showBack: true,
      handleBackButton: handleQualifyBack,
      submitUrl: '/api/qualify-submit',
      formHolderClasses: 'pt-5',
      formClasses: 'mt-9 grid grid-cols-1 lg:grid-cols-2 gap-y-6 sm:gap-x-8',
      textInputHolderClasses: 'col-span-2 lg:col-span-1',
      title: 'Qualification Form',
      descriptionText: 'It looks like you aren\'t in our system yet or we are missing some important information.  Please complete our qualification form so that we can show you the suites that match your preferences.'
    }

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
      },
      title: 'Book Viewing',
      descriptionText: 'Choose a property, suite(s), and an available timeslot you would like to book on.',
      formHolderClasses: 'none',
      disclaimerText: 'Please Note, a booking does not guarantee a showing or rental of a suite.  Hollyburn Properties rents on a first come first serve basis for qualified prospects.  ' +
            'In the event that a suite is rented before a showing any pending showings will be cancelled.'
    }

    //if view state is set then overriding the normal view
    if (currentView) {
      switch(currentView) {
        case 'basic':
          return (
              <>
                <WizardContent {...basicOptions} />
                <BasicForm stateSetter={setBasicForm} options={basicOptions} {...basicForm} />
                {
                  error.error &&
                  <ErrorMessage />

                }
              </>
          )
        case 'qualify':
          return (
              <>
                <WizardContent {...qualifyOptions} />
                <QualifyForm options={qualifyOptions} {...preferences} stateSetter={setQualifyForm} />
              </>
          )
        case 'book':
          return (
              <>
                <WizardContent {...bookAViewingOptions} />
                <BookAViewing options={bookAViewingOptions} stateSetter={setBookingForm} vacancyId={vacancyId} />
                {
                  error.error &&
                  <ErrorMessage />

                }
              </>
          )
      }
    }
    else {
      if (!basicForm.result) {
        return (
            <>
              <WizardContent {...basicOptions} />
              <BasicForm stateSetter={setBasicForm} options={basicOptions} {...basicForm} />
                {
                    error.error &&
                    <ErrorMessage />

                }
            </>
        )
      }
      //basic form is complete, but the lead is not qualified.  Show the qualification form
      else if (basicForm.checkComplete && basicForm.result && !basicForm.isQualified && !qualifyForm.result) {
        return (
            <>
              <WizardContent {...qualifyOptions} />
              <QualifyForm options={qualifyOptions} {...preferences} stateSetter={setQualifyForm} />
            </>
        )
      }
      //basic form is complete and user is qualified already.  Show the book a viewing form.
      else if (basicForm.checkComplete && basicForm.result && basicForm.isQualified) {
        return (
            <>
              <WizardContent {...bookAViewingOptions} />
              <BookAViewing options={bookAViewingOptions} stateSetter={setBookingForm} vacancyId={vacancyId} />
              {
                error.error &&
                <ErrorMessage />

              }
            </>
        )
      }
      //basic and qualify form are completed.  show book a viewing form
      else if (basicForm.checkComplete && qualifyForm.result && qualifyForm.qualifyComplete) {
        return (
            <>
              <WizardContent {...bookAViewingOptions} />
              <BookAViewing options={bookAViewingOptions} stateSetter={setBookingForm} vacancyId={vacancyId} />
              {
                error.error &&
                <ErrorMessage />

              }
            </>
        )
      }
      //loading and nothing else is going on
      else if (isLoading) {
        return (
            <div className={"p-10 h-48"}></div>
        )
      }
      else if (error && error.errorMessage) {
        return <ErrorMessage />
      }
    }

  }

  //the thank-you message that is displayed at the end of the booking.
  const thankYouMessage = () => {
    return (
        <>
          <span className="block">
            Thank you for using our self-booking form!
          </span>
          <span className="block">
            Please check your email for your calendar invite.  If you need to cancel or modify your booking you can use the Manage Booking link inside of the calendar invite.
          </span>
          <span className={"my-5 block"}>
            <button onClick={event => resetForm(event)} type={"button"} className={"w-full inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base " +
                "text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"}>Book Additional Showings</button>
          </span>
        </>
    )
  }


  if (bookingStatus.status === 'booked') {
    return (
      <>
        <ThankYou message={thankYouMessage()} />
      </>
    )
  }
  else {
    return (
        <main>

            {/*Hero image*/}
            <HeroImage imageClass={'bg-bookingBanner'} />

            <div className="min-h-screen grid grid-cols-1 items-center pt-44 2xl:pt-72">
                {/*Book a viewing text*/}
                <div className="relative">
                    <div className="max-w-md sm:max-w-lg mx-auto pl-4 pr-8 sm:px-6 lg:max-w-7xl lg:px-8 py-24 bg-white z-50 xl:rounded-xl">
                        <h1 className="text-4xl leading-10 font-extrabold tracking-tight text-gray-900 text-center sm:text-5xl sm:leading-none lg:text-6xl">
                            Book A Viewing
                        </h1>
                        <p className="mt-6 max-w-3xl mx-auto text-xl leading-normal text-gray-500 text-center">
                            Use our self-serve Book A Viewing wizard below to qualify yourself and book your next suite viewing.
                        </p>
                        <div className="mt-6 max-w-3xl mx-auto leading-normal text-gray-500 text-center">
                            <button type="button" onClick={event => scrollToWizardTop(event)} className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto">Get Started</button>
                        </div>
                    </div>
                </div>
            </div>

          {/* Wizard */}
          <div className="relative bg-hbLightGray min-h-screen pb-4">
            <Element name="wizard-top"></Element>

            {/*Loading Widget*/}
            <LoadingWidget isLoading={isLoading} />

            {/*right side image*/}
            <div className="lg:absolute lg:inset-0">
              <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                  {
                      wizardImg &&
                      <img className="h-56 w-full object-cover lg:absolute lg:h-full transition transition-all ease-in-out duration-300"
                           src={`/images/${wizardImg}`}
                           alt="Book a Viewing" />
                  }
              </div>
            </div>

            {/*Form Holder*/}
            <div className="relative px-4 sm:px-6 lg:px-8 lg:mx-auto lg:grid lg:grid-cols-2 min-h-screen items-center">
              <div className="lg:pr-8">
                <div className="lg:px-10 my-10">

                  {/*Wizard Component*/}
                  <Wizard />

                </div>
              </div>
            </div>

          </div>

          {/* Need Assistance ?? */}
            <NeedAssistance />

        </main>
    )
  }

}