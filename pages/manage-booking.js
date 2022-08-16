import axios from "axios";
import {LoadingWidget} from "hollyburn-lib";
import React from 'react';
import {Element} from "react-scroll";
import {scrollToWizardTop} from "./helpers";

export async function getServerSideProps(context) {

    const {event_id: eventId} = context.query;
    if (!eventId) {
        return {
            props: {
                booking: null
            }
        }
    }

    const getBooking = await axios.get(`http://localhost:3000/api/get-booking`, {
        data: {
            eventId
        }
    });
    const {booking = null} = getBooking.data;
    return {
        props: {
            booking
        }
    }

}

export default function ManageBooking({booking}) {

    const [isLoading, setIsLoading] = React.useState(false);

    if (!booking) {
        return (
            <div>This is not a valid event!</div>
        )
    }

    console.log(booking);

    return (
        <main>

            <div className="min-h-screen grid grid-cols-1 items-center">
                <div className="relative">
                    {/*Hero image*/}
                    <section className="block">
                        <div className="py-44 lg:py-60 w-full bg-cover relative text-white bg-manageBanner lg:bg-right">
                            <div className="relative h-full"></div>
                        </div>
                    </section>
                    {/*Book a viewing text*/}
                    <div className="relative">
                        <div className="max-w-md mx-auto pl-4 pr-8 sm:max-w-lg sm:px-6 lg:max-w-7xl lg:px-8 py-24 bg-white z-50">
                            <h1 className="text-4xl leading-10 font-extrabold tracking-tight text-gray-900 text-center sm:text-5xl sm:leading-none lg:text-6xl">
                                Manage your Booking
                            </h1>
                            <p className="mt-6 max-w-3xl mx-auto text-xl leading-normal text-gray-500 text-center">
                                Need to manage your booking? Please use options below
                            </p>
                            <div className="mt-6 max-w-3xl mx-auto leading-normal text-gray-500 text-center">
                                <button type="button" onClick={event => scrollToWizardTop(event)} className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto">Manage Booking</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative bg-hbLightGray min-h-screen">

                <Element name="wizard-top"></Element>

                {/*Loading Widget*/}
                <LoadingWidget isLoading={isLoading} />

                {/*right side image*/}
                <div className="lg:absolute lg:inset-0">
                    <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                        <img className="h-56 w-full object-cover lg:absolute lg:h-full transition transition-all ease-in-out duration-300"
                             src={`/images/wizard1.jpg`}
                             alt="Book a Viewing" />
                    </div>
                </div>


            </div>

        </main>
    )

}