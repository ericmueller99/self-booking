import axios from "axios";
import {LoadingWidget} from "hollyburn-lib";
import React from 'react';
import {Element} from "react-scroll";
import HeroImage from "./components/HeroImage";
import CancelModel from "./components/CancelModel";
import {getCalendarEventFromSalesforce} from '../lib/connections';

export async function getServerSideProps(context) {

    const {manage_key: manageKey} = context.query;
    if (!manageKey) {
        return {
            props: {
                booking: null
            }
        }
    }
    const bookingData = await getCalendarEventFromSalesforce(manageKey);
    if (!bookingData.result || !bookingData.booking.eventId) {
        return {
            props: {
                booking: null
            }
        }
    }
    return {
        props: {
            booking: bookingData.booking
        }
    }

}

export default function ManageBooking({booking}) {

    const [isLoading, setIsLoading] = React.useState(false);
    const [wizardType, setWizardType] = React.useState(null);
    const [bookingDetails, setBookingDetails] = React.useState({});

    //set bookingDetails state
    React.useEffect(() => {
        if (booking && booking.eventId) {
            setBookingDetails(booking);
        }
    }, [booking]);

    //cancel the booking
    const cancelBooking = () => {

        if (isLoading) {
            return;
        }
        setIsLoading(true);

        const postData = {
            eventId: bookingDetails.eventId
        }
        axios.post('/api/cancel-booking', postData)
            .then(res => {
                setIsLoading(false);
                setBookingDetails({
                    ...bookingDetails,
                    isCancelled: true
                })
            })
            .catch(error => {
                console.log(error);
            })

    }

    if (!booking) {
        return (
            <main>
                <HeroImage imageClass={'bg-manageBanner'} />
                <div className="min-h-screen grid grid-cols-1 items-center pt-44 2xl:pt-72">
                    <div className="relative">
                        <div className="max-w-md sm:max-w-lg mx-auto pl-4 pr-8 sm:px-6 lg:max-w-7xl lg:px-8 py-24 bg-white z-50 xl:rounded-xl">
                            <h1 className="text-4xl leading-10 font-extrabold tracking-tight text-gray-900 text-center sm:text-5xl sm:leading-none lg:text-6xl">
                                Booking not found
                            </h1>
                            <p className="mt-6 max-w-3xl mx-auto text-xl leading-normal text-gray-500 text-center">
                                This is not a valid booking link.
                            </p>
                            <p className="mt-6 max-w-3xl mx-auto text-xl leading-normal text-gray-500 text-center">
                                If you have previously cancelled your booking this is normal.  If you have not cancelled your booking and need assistance please contact our Rental Advisor team at
                            </p>
                            <dl className="mt-6 max-w-3xl mx-auto text-sm leading-normal text-gray-500 text-center">
                                <dd><span className="font-bold">Vancouver/Calgary: </span>604-200-3420</dd>
                                <dd><span className="font-bold">Toronto/Ottawa: </span> 436-888-8958</dd>
                                <dd><span className="font-bold">Email: </span> rent@hollyburn.com</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    const Wizard = () => {
        switch (wizardType) {
            case 'cancel-booking':
                return (
                    <CancelModel setWizardType={setWizardType} actionFunction={cancelBooking} initialState={!bookingDetails.isCancelled} />
                )
            default:
                return(
                    <Element name="wizard-top"></Element>
                )
        }
    }

    return (
        <main>

            {/*Loading Widget*/}
            <LoadingWidget isLoading={isLoading} />

            <HeroImage imageClass={"bg-manageBanner"} />
            <div className="min-h-screen grid grid-cols-1 items-center pt-44 2xl:pt-72">
                {/*Book a viewing text*/}
                <div className="relative">
                    <div className="max-w-md sm:max-w-lg mx-auto pl-4 pr-8 sm:px-6 lg:max-w-7xl lg:px-8 py-24 bg-white xl:rounded-xl">
                        <h1 className="text-4xl leading-10 font-extrabold tracking-tight text-gray-900 text-center sm:text-5xl sm:leading-none lg:text-6xl">
                            Manage Booking
                        </h1>
                        <div className="relative bg-white px-6 pt-10 pb-8 mt-10 sm:mx-auto sm:rounded-lg sm:px-10">
                            <div className="mx-auto max-w-2xl">
                                <div className="divide-y divide-gray-300/50">
                                    <div className="space-y-6 text-base leading-7 text-hbGray">
                                        <p className="text-xl font-bold border-b border-b-gray-300/50 pb-5">Booking Details</p>
                                        <ul className="space-y-4">
                                            <li className="flex lg:items-center lg:flex-row flex-col">
                                                <span className="font-bold mr-1 pb-1 lg:pb-0">Name: </span>
                                                <span>{bookingDetails.subject}</span>
                                            </li>
                                            <li className="flex lg:items-center lg:flex-row flex-col">
                                                <span className="font-bold mr-1 pb-1 lg:pb-0">Start: </span>
                                                <span>{bookingDetails.start}</span>
                                            </li>
                                            <li className="flex lg:items-center lg:flex-row flex-col">
                                                <span className="font-bold mr-1 pb-1 lg:pb-0">End: </span>
                                                <span>{bookingDetails.end}</span>
                                            </li>
                                            <li className="flex lg:items-center lg:flex-row flex-col">
                                                <span className="font-bold mr-1 pb-1 lg:pb-0">Location: </span>
                                                <span>{bookingDetails.location}</span>
                                            </li>
                                        </ul>
                                    </div>
                                    {
                                        !bookingDetails.expired && !bookingDetails.isCancelled &&
                                        <div className="mt-6 pt-4 max-w-3xl mx-auto leading-normal text-gray-500 text-center">
                                            <button type="button" onClick={() => setWizardType('cancel-booking')}
                                                    className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium
                                    text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto">Cancel Booking
                                            </button>
                                            &nbsp;
                                            {/*    <button type="button" onClick={(event) => scrollToWizardTop(event, {stateSetter: setWizardType, newState: 'cancel-booking'})}*/}
                                            {/*            className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium*/}
                                            {/*text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto">Update Booking*/}
                                            {/*    </button>*/}
                                        </div>
                                    }
                                    {
                                        bookingDetails.expired && !bookingDetails.isCancelled &&
                                        <p className="font-bold my-5 text-red-600 py-6 text-lg">Your booking date has already passed.</p>
                                    }
                                    {
                                        bookingDetails.isCancelled && !bookingDetails.expired &&
                                        <p className="font-bold my-5 text-red-600 py-6 text-lg">Booking is cancelled.  Please check your email for confirmation.</p>
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Wizard />

        </main>
    )

}