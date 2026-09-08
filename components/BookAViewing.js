import React  from 'react';
import {useForm, useWatch} from 'react-hook-form';
import {CheckCircleIcon, InformationCircleIcon} from "@heroicons/react/solid";
import {Transition} from '@headlessui/react'
import {AvailableSuites, UpdatePreferenceBanner, VacancyDisplayType} from "./form-fields";
const momentTz = require('moment-timezone');
import {
    buttonTailwindClasses,
    formatDate,
    formHolderTailwindClasses,
    formTailwindClasses,
    labelTailwindClasses,
    txtInputTailwindClasses,
    propertyOptGroupBuilder,
    hbOrangeButtonClasses,
    filterProperties,
    filterPropertiesWithPrefs,
    getVacancyFeed,
    availableSuiteHolderTailwindClasses, filterVacanciesFromProperty, getVacanciesFromIds, formatDateWithTime
} from "../lib/form-helpers";
import {PropertySelectWithOptGroup, FormErrors} from "./form-fields";

//this form is generally part of a wizard, so instead of submission directly it is given a function that will update state that the wizard is watching
export function BookAViewing({vacancyId, stateSetter, options = {}}) {

    const {buttonText = 'Submit', showBack, handleBackButton, preferences: formPrefs = {},
        showUpdatePrefsBanner, handleUpdatePrefs, formHolderClasses = formHolderTailwindClasses(), formClasses = formTailwindClasses(),
        buttonClasses = buttonTailwindClasses(), hbOrangeButton = hbOrangeButtonClasses(), availableSuiteHolderClasses = availableSuiteHolderTailwindClasses(),
        textInputClasses = txtInputTailwindClasses(), labelClasses = labelTailwindClasses(), updatePrefsIconHolderClasses
    } = options;
    const updatePrefsOptions = {
        iconHolderClasses: updatePrefsIconHolderClasses
    }
    const [refreshFeed, setRefreshFeed] = React.useState(true);
    const [vacancyFeed, setVacancyFeed] = React.useState([]);
    const [propertyOptions, setPropertyOptions] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(false);
    const {control, watch, register, handleSubmit, formState: {errors}, setError, setValue, getValues, resetField} = useForm({
        defaultValues: {
            vacancyDisplayType: vacancyId ? 'no' : 'yes',
            suites: vacancyId ? [vacancyId] : []
        }
    })
    const [suiteOptions, setSuiteOptions] = React.useState([]);
    const suiteWatch = useWatch({
        control,
        name: 'suites'
    })
    const [dayOptions, setDayOptions] = React.useState([]);
    const dayWatch = watch('date');
    const propertyWatch = watch('property');
    const [timeOptions, setTimeOptions] = React.useState([]);
    const timeWatch = watch('timeslot');
    const [preferences, setPreferences] = React.useState(formPrefs)
    const vacancyDisplayTypeWatch = watch('vacancyDisplayType');
    const [preferenceWarning, setPreferenceWarning] = React.useState({showWarning: false});

    const dismissPreferenceWarning = (event) => {
        if (event && event.preventDefault()) {
            event.preventDefault();
        }
        setPreferenceWarning({
            ...preferenceWarning,
            showWarning: false,
            dismissed: true
        })
    }

    //get the vacancy feed.  this contains properties and all vacant units that we can use to populate the form.
    React.useEffect(() => {

        if (!refreshFeed || isLoading) {
            return;
        }

        console.log('getting vacancy feed!');
        setIsLoading(true);
        setRefreshFeed(false);

        //getting the vacancy feed.
        getVacancyFeed()
          .then(data => {
              setVacancyFeed(data);
              setIsLoading(false);
          })
          .catch(error => {
              setIsLoading(false);
              throw error;
          });

    }, [refreshFeed]);

    //the vacancy feed data has been refreshed.
    React.useEffect(() => {

        resetField('suites');
        resetField('date');
        resetField('timeslot');

        //if there are preferences and the vacancyDisplayWatch === 'yes' then applying those preferences
        if (preferences && vacancyDisplayTypeWatch === 'yes') {
            const properties = filterPropertiesWithPrefs(vacancyFeed, preferences);
            setPropertyOptions(propertyOptGroupBuilder(properties));
        }
        else {
            const properties = filterProperties(vacancyFeed);
            setPropertyOptions(propertyOptGroupBuilder(properties));
        }

        //if there is a vacancy Id then prefill the form.
        if (vacancyId && vacancyDisplayTypeWatch === 'no') {
            try {
                if (parseInt(vacancyId)) {
                    //trying to find the vacancy
                    let vacancy;
                    const [property] = vacancyFeed.filter(p => {
                        if (p.vacancies && p.vacancies.length > 0) {
                            for (const v of p.vacancies) {
                                if (v.vacancyId === parseInt(vacancyId)) {
                                    vacancy = v;
                                    return true;
                                }
                            }
                        }
                    })

                    //getting the properties filtered by preference so we can see if the preference matches the property selected on hollyburn.com
                    if (preferences && property) {
                        const preferenceProperties = filterPropertiesWithPrefs(vacancyFeed, preferences);
                        const linkedFromPreferences = preferenceProperties.filter(p => p.value === property.propertyHMY);
                        if (linkedFromPreferences.length === 0 && !preferenceWarning.dismissed) {
                            setPreferenceWarning({
                                ...preferenceWarning,
                                showWarning: true,
                                preferenceProperties
                            });
                        }
                    }

                    if (property && vacancy) {
                        setValue('property', property.propertyHMY)
                    }
                }
            }
            catch (e) {
                console.log('unable to load from vacancyId');
                console.log(e);
            }
        }
        else {
            setPreferenceWarning({
                ...preferenceWarning,
                showWarning: false
            })
        }

        if (!vacancyId) {
            setValue('property', 'Please Select...');
            resetField('suites');
            resetField('date');
            resetField('timeslot');
        }

    }, [vacancyFeed, vacancyDisplayTypeWatch])

    //property has been changed
    React.useEffect(() => {

        //if there is no propertyWatch then return early.
        if (!propertyWatch) {
            return;
        }

        //getting vacancies and setting the suite options from them.
        if (vacancyDisplayTypeWatch === 'yes') {
            const vacancies = filterVacanciesFromProperty(vacancyFeed, propertyWatch, preferences);
            setSuiteOptions(vacancies);
        }
        else {
            const vacancies = filterVacanciesFromProperty(vacancyFeed, propertyWatch);
            setSuiteOptions(vacancies);
        }

        //resetting fields
        setValue('suites', []); //resetting this way because resetField is not working for this.
        resetField('date');
        resetField('timeslot');

    }, [propertyWatch])

    //day options.
    React.useEffect(() => {

        if (!suiteWatch || suiteWatch.length === 0) {
            setDayOptions([]);
            setTimeOptions([]);
            return;
        }

        if (isLoading) {
            return
        }

        //clean the suite watch into an array of numbers and get the property information from the vacancyFeed state.
        const suiteWatchCleaned = Array.isArray(suiteWatch) ? new Set(suiteWatch.map(s => Number(s))) : new Set([Number(suiteWatch)]);
        const [property] = vacancyFeed.filter(p => p.hasVacancy === true).filter(p => {
            for (const v of p.vacancies) {
                if (suiteWatchCleaned.has(v.vacancyId)) {
                    return true;
                }
            }
        });

        if (!property) {
            return;
        }

        setIsLoading(true);
        resetField('timeslot');
        resetField('date');

        //format the startDate and endDate time
        const currentDate = new Date();
        const oneDayInMillis = 100800000; //28 hours to give a bit of a buffer for notices etc...
        let availabilityStart = new Date(currentDate.getTime() + oneDayInMillis);
        //rounding the start date to the nearest 30 minutes
        availabilityStart = new Date(Math.round(availabilityStart.getTime() / (1000 * 60 * 30)) * (1000 * 60 * 30));

        const availabilityEnd = new Date(currentDate.getTime() + (oneDayInMillis*5));
        const numberOfSuites = suiteWatchCleaned.size;
        const url = `https://api.hollyburn.com/properties/property/${property.propertyHMY}/availability/?startDate=${formatDateWithTime(availabilityStart)}&endDate=${formatDateWithTime(availabilityEnd)}&numberOfSuites=${numberOfSuites}`;
        // const url = `http://localhost:3001/properties/property/${property.propertyHMY}/availability/?startDate=${formatDateWithTime(availabilityStart)}&endDate=${formatDateWithTime(availabilityEnd)}&numberOfSuites=${numberOfSuites}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setIsLoading(false);
                const dayInterval = new Date(availabilityStart);
                const availabilityByDay = [];
                while (dayInterval <= availabilityEnd) {
                    availabilityByDay.push({
                        label: formatDate(dayInterval),
                        value: formatDate(dayInterval),
                        availableSlots: data.filter(d => {
                            const start = new Date(d.start);
                            return start.getDate() === dayInterval.getDate()
                        }).length,
                        timeSlots: data.filter(d => {
                            const start = new Date(d.start);
                            return start.getDate() === dayInterval.getDate()
                        })
                    })
                    dayInterval.setDate(dayInterval.getDate() + 1);
                }
                setDayOptions(availabilityByDay);

            })
            .catch(error => {
                setIsLoading(false);
                throw error;
            })


    }, [suiteWatch])

    //timeslots
    React.useEffect(() => {

        if (!dayWatch) {
            return;
        }

        resetField('timeslot')

        //finding the timeslots that match the selected day.
        const [{timeSlots}] = dayOptions.filter(d => d.value === dayWatch);
        if (timeSlots) {
            const timeSlotOptions = timeSlots.map((t, index) => {
                return {
                    // start: moment(t.start).format('h:mm A'),
                    start: momentTz.tz(t.start, t.timezone).format('h:mm A'),
                    end:  momentTz.tz(t.end, t.timezone).format('h:mm A'),
                    key: index,
                    // value: `${momentTz.tz(t.start, t.timezone).format('YYYY-MM-DDTHH:mm:ss')}to${momentTz.tz(t.end, t.timezone).format('YYYY-MM-DDTHH:mm:ss')}`,
                    value: `${momentTz.tz(t.start, t.timezone).format()}to${momentTz.tz(t.end, t.timezone).format()}`,
                }
            })
            setTimeOptions(timeSlotOptions)
        }

    }, [dayWatch])

    //days and time slots available based on the property & unit(s) selected.
    function AvailableDays() {

        if (!suiteWatch || suiteWatch.length === 0 || !suiteOptions || suiteOptions.length === 0) {
            return '';
        }

        return (
            <div className={"col-span-2"}>
                <fieldset>
                    <p>
                        Choose the day you would like to book on. <br />
                        <span className={"text-xs"}>(Please note, we only allow booking up to 4 days in advance)</span>
                    </p>
                    <div className={"mt-4 gap-x-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-4"}>
                        {
                            dayOptions.map(day => {
                                return day.availableSlots ?
                                    <label className={`relative bg-white border rounded-md shadow-xl p-4 flex cursor-pointer focus:outline-none ${day.value === dayWatch ? 'border border-hbBlue' : ''}`} key={day.value}>
                                        <input type="radio" name="date" value={day.value} className={"sr-only"} {...register('date', {required: 'Please select a viewing day.'})} />
                                        <span className={"flex-1 flex"}>
                                            <div className={"flex w-3/4"}>
                                                <span className={"flex flex-col"}>
                                                    <span className={"block text-sm font-medium text-gray-900"}>{day.label}</span>
                                                    <span className={"block text-sm font-medium"}>Available Slots: <span className={"text-green-600"}>{day.availableSlots}</span></span>
                                                </span>
                                            </div>
                                                <span className={"flex items-center w-1/4 justify-end"}>
                                                    <CheckCircleIcon className={`${day.value === dayWatch ? 'h-6 w-6 text-green-600' : 'hidden'}`} />
                                                </span>
                                            </span>
                                    </label>
                                    :
                                    //No availability
                                    <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex border border-red-400 cursor-not-allowed`} key={day.value}>
                                        <input type="radio" name="date" value={day.value} className={"sr-only"} {...register('date', {required: true})} disabled />
                                        <span className={"flex-1 flex"}>
                                                <span className={"flex flex-col"}>
                                                    <span className={"block text-sm font-medium text-gray-900"}>{day.label}</span>
                                                    <span className={"block text-sm font-medium"}>Available Slots: <span className={"text-red-600"}>{day.availableSlots}</span></span>
                                                </span>
                                            </span>
                                    </label>
                            })
                        }
                    </div>
                </fieldset>
            </div>
        )
    }

    //available timeslots of the property/suites/day selected.
    function AvailableTimeSlots() {

        if (!dayWatch || dayOptions.length === 0) {
            return '';
        }

        return (
            <div className={`col-span-2`}>
                <fieldset>
                    <p>
                        Choose an available timeslot. <br/>
                        <span className="text-xs">(all times are in the local timezone of the property)</span>
                    </p>
                    <div className={"mt-4 gap-x-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4"}>
                        {
                            timeOptions.map(t => (
                                <label className={`relative bg-white border rounded-md shadow-xl p-4 flex cursor-pointer focus:outline-none ${timeWatch === t.value ? 'border border-hbBlue' :''}`} key={t.key}>
                                    <input type="radio" name="timeslot" className={"sr-only"} {...register('timeslot', {required: 'Please select a viewing time.'})} value={t.value} />
                                    <span className={"flex-1 flex items-center justify-between"}>
                                        <span>
                                            <span className="text-sm font-medium text-gray-900 text-center">{t.start}</span>
                                            <span className="text-sm font-medium text-gray-900 text-center">-</span>
                                            <span className="text-sm font-medium text-gray-900 text-center">{t.end}</span>
                                        </span>
                                        <CheckCircleIcon className={timeWatch === t.value ? 'h-6 w-6 text-green-600' : 'hidden'} />
                                    </span>
                                </label>
                            ))
                        }
                    </div>
                </fieldset>
            </div>
        )
    }

    //form submission
    const onSubmit = (data) => {

        console.log(data);

        //making sure property is not 'Please Select...'
        const {property, suites, timeslot} = data;
        if (property === 'Please Select...') {
            setError('property',{message: 'Please select a property.'});
            return;
        }

        //getting vacancies from the selected suites/vacancies
        const vacancyIds = Array.isArray(suites) ? suites : [parseInt(suites)];
        const vacancies = getVacanciesFromIds(vacancyFeed, vacancyIds);

        //constructing the state data.
        const stateData = {
            result: true,
            property: Number(property),
            suites: vacancies,
            startDate: timeslot.split('to')[0],
            endDate: timeslot.split('to')[1]
        }
        if (stateSetter && typeof stateSetter === 'function') {
            stateSetter(stateData);
        }
        else {
            console.log('Unable to set state.  stateSetter is not a function.');
            console.log('state data:');
            console.log(stateData);
        }

    }

    return (
        <div className={formHolderClasses}>

            {/*Loading Widget*/}
            <div className={isLoading ? 'block' : 'hidden'}>
                <div className={"w-full h-full bg-hbLightGray absolute top-0 left-0 opacity-60 z-40"}></div>
                <div className={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} style={{zIndex: 400}}>
                    <img src="/images/loading.gif" height="150px" width="150px" alt="Loading..." />
                </div>
            </div>

            <form className={formClasses} onSubmit={handleSubmit(onSubmit)}>

                <Transition
                  show={preferenceWarning.showWarning}
                  enter="col-span-2 transition ease duration-700 transform"
                  enterFrom="opacity-0 -translate-y-full"
                  enterTo="opacity-100 translate-y-0"
                  entered="col-span-2"
                  leave="col-span-2 transition ease duration-1000 transform"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 -translate-y-full"
                >
                    <div className={"col-span-2"}>
                        <div className="rounded-md bg-white p-4 border border-red-700">
                            <div className="flex">
                                <div className="flex-1 flex justify-between items-center space-y-2">
                                    <p className="flex items-center ml-1">The suite you choose on Hollyburn.com does not match your saved preferences.  Please confirm the suite details before booking.</p>
                                    <button type="button" className={buttonClasses} onClick={event => dismissPreferenceWarning(event)}>Dismiss</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>

                {/*Display type.  Filtered on preferences or shows all vacancies*/}
                <VacancyDisplayType register={register} />

                {/*update preferences banner*/}
                {showUpdatePrefsBanner && vacancyDisplayTypeWatch === 'yes' && handleUpdatePrefs && typeof handleUpdatePrefs === 'function' && propertyOptions.length > 0 &&
                    <UpdatePreferenceBanner handleUpdatePrefs={handleUpdatePrefs} options={updatePrefsOptions} />
                }

                {/*Step 1 - Select a Property*/}
                {
                    propertyOptions && propertyOptions.length > 0 &&
                    <div className={"col-span-2"}>
                        <label htmlFor={"property"} className={labelClasses}>Select a Property <br/> <span className={"text-xs"}>{vacancyDisplayTypeWatch === 'yes' ? '(Vacancies are filtered by your preferences)' : '(Only properties with vacancies are displayed)'}</span> </label>
                        <div className={"mt-1"}>
                            <PropertySelectWithOptGroup propertyOptions={propertyOptions} register={register} tailwindClasses={textInputClasses} />
                        </div>
                        <Transition
                          show={propertyWatch && propertyWatch !== 'Please Select...' ? true : false}
                          enter="transition ease duration-700 transform"
                          enterFrom="opacity-0 -translate-y-full"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease duration-1000 transform"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 -translate-y-full"
                        >
                            <a href={vacancyFeed.filter(v => parseInt(v.propertyHMY) === parseInt(propertyWatch)).map(p => p.websiteUrl)} className={hbOrangeButton} target={"_blank"} rel="noreferrer">View Property Details</a>
                        </Transition>
                    </div>
                }
                {
                    !propertyOptions || propertyOptions.length === 0 &&
                    <div className="col-span-2">
                        <div className="rounded-md bg-white p-4 border border-red-400">
                            <div className="flex">
                                <div className="flex-shrink-0 items-center flex">
                                    <InformationCircleIcon className="h-5 w-5 text-hbBlue" aria-hidden="true" />
                                </div>
                                <div className="flex-1 md:flex md:justify-between">
                                    <p className="flex items-center ml-1">There are currently no vacancies available that match your preferences.</p>
                                    <p className="flex items-center">
                                        <button type="button" className={"w-full inline-flex items-center justify-center px-6 py-1 border border-transparent rounded-md shadow-sm text-base " +
                                            "text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"} onClick={event => handleUpdatePrefs(event)}>Update Preferences</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {/*Step 2 - Choose Available Suites*/}
                {
                    console.log(propertyWatch)
                }
                <AvailableSuites availableSuiteHolderClasses={availableSuiteHolderClasses} suiteWatch={suiteWatch} suiteOptions={suiteOptions} register={register} hbOrangeButton={hbOrangeButton} options={{useNoSelfBookingFlag: true}} />

                {/*Step 3 - Choose date */}
                <AvailableDays control={control} />

                {/*Step 4 - Choose a time slot*/}
                <AvailableTimeSlots control={control} />

                <FormErrors errors={errors} />

                <div className={"col-span-2 flex justify-end"}>
                    {showBack && handleBackButton &&
                        <>
                            <button type="button" className={`${buttonClasses} mr-1`} onClick={event => handleBackButton(event)} >Back</button>
                            &nbsp;
                        </>
                    }
                    <button type={"submit"} className={buttonClasses}>
                        {buttonText}
                    </button>
                </div>

            </form>

        </div>
    )
}