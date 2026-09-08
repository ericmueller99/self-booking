import React from "react";
import DatePicker from "react-datepicker";
import Image from "next/image";
import {useForm, Controller, useWatch} from 'react-hook-form';
import moment from 'moment';
import axios from "axios";
import {XCircleIcon} from "@heroicons/react/solid";

import {
    buttonTailwindClasses,
    checkboxTailwindClasses, formHolderTailwindClasses,
    formTailwindClasses,
    isPetFriendlyRequired,
    labelTailwindClasses, suiteTypeMapper, txtInputHolderTailwindClasses,
    txtInputTailwindClasses
} from "../lib/form-helpers";

export function QualifyForm ({firstName, lastName, emailAddress, phoneNumber, maxBudget, moveIn, suiteTypes, cities, neighbourhoods, numberOfOccupants, petFriendly, utmCampaign, utmSource, utmMedium, utmContent, utmTerm, stateSetter, options = {}}) {

    const occupantOptions = [
        {label: 1, value: 1},
        {label: 2, value: 2},
        {label: 3, value: 3},
        {label: 4, value: 4},
        {label: 5, value: 5},
    ]
    const petFriendlyOptions = [
        {label: 'Yes', value: 'true'},
        {label: 'No', value: 'false'}
    ]
    const [cityOptions, setCityOptions] = React.useState([]);
    const [neighbourhoodOptions, setNeighbourhoodOptions] = React.useState([]);
    const [suiteTypeOptions, setSuiteTypeOptions] = React.useState([]);

    const {buttonText = 'Submit', submitUrl = '/api/submit', showBack, handleBackButton,
        formClasses = formTailwindClasses(), textInputClasses = txtInputTailwindClasses(), labelClasses = labelTailwindClasses(),
        formHolderClasses = formHolderTailwindClasses(), textInputHolderClasses = txtInputHolderTailwindClasses(), checkboxClasses = checkboxTailwindClasses(),
        buttonClasses = buttonTailwindClasses(), showCancel = false, handleCancelButton, cancelButtonTailwindClasses = buttonTailwindClasses(), additionalSubmitData = {}, readSubmitResult = true

    } = options;

    //get city options
    React.useEffect(() => {

        if (cityOptions.length > 0) {
            return;
        }

        axios.get('https://api.hollyburn.com/properties/cities')
          .then(res => {
              const cities = res.data;
              const formattedCities = cities.map(c => {
                  return {name: c, value: c, fieldName: `city-${c}`};
              })
              setCityOptions(formattedCities);
          })
          .catch(error => {
              console.log('error getting cities');
              console.log(error);
          })

    }, [cityOptions]);
    //get neighbourhood options
    React.useEffect(() => {

        if (neighbourhoodOptions.length > 0) {
            return;
        }

        axios.get('https://api.hollyburn.com/properties/neighbourhoods')
          .then(res => {
              const neighbourhoods = res.data;
              const formattedNeighbourhoods = neighbourhoods.map(n => {
                  return {
                      name: n.name,
                      inCity: n.inCity,
                      fieldName: n.name.replace(/ /g, '-'),
                      value: n.name
                  }
              })
              setNeighbourhoodOptions(formattedNeighbourhoods);
          })
          .catch(error => {
              console.log('there was an error getting neighbourhoods');
              console.log(error);
          })

    }, [neighbourhoodOptions])
    //get suite type options
    React.useEffect(() => {

        if (suiteTypeOptions.length > 0) {
            return;
        }

        axios.get('https://api.hollyburn.com/properties/bedroom-types')
          .then(res => {
              const suiteTypes = res.data;
              const formattedSuiteTypes = suiteTypes.map(s => {
                  return {
                      name: suiteTypeMapper(s),
                      value: s,
                      fieldName: `suiteType-${s}`
                  }
              })
              setSuiteTypeOptions(formattedSuiteTypes);
          })
          .catch(error => {
              console.log('there was an error getting bedroom types');
              console.log(error);
          })

    }, [suiteTypeOptions]);

    const {control, register, handleSubmit, formState: {errors}, setError, setValue, getValues} = useForm({
        defaultValues: {
            firstName, lastName, emailAddress, phoneNumber, maxBudget, moveIn, suiteTypes, cities, neighbourhoods, numberOfOccupants, petFriendly: isPetFriendlyRequired(petFriendly) ? 'true' : 'false'
        }
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasCriticalError, setHasCriticalError] = React.useState(false)
    const [criticalErrorMessage, setCriticalErrorMessage] = React.useState('');

    function NeighbourhoodOptions({control}) {


        //subscribing to change events for the cities options
        const cities = useWatch({
            control,
            name: 'cities'
        });
        if (cities && neighbourhoodOptions && neighbourhoodOptions.length > 0) {

            //which neighbourhoods should be shown ?
            const neighbourhoods = neighbourhoodOptions.filter(n => cities.includes(n.inCity));
            const selectedNeighbourhoods = getValues('neighbourhoods');
            if (selectedNeighbourhoods && selectedNeighbourhoods.length > 0) {
                const validSelectedNeighbourhoods = neighbourhoods.filter(n => {
                    return !!selectedNeighbourhoods.includes(n.value);
                }).map(n => n.value);
                setValue('neighbourhoods', validSelectedNeighbourhoods);
            }

            if (neighbourhoods.length === 0) {
                return '';
            }

            return (
                <>
                    <div className={"col-span-2 sm:col-auto"}>
                        <label className={labelClasses}>*Interested Neighbourhoods</label>
                    </div>
                    <div className={"col-span-2"}>
                        {neighbourhoods.map(n => (
                            <div className={"relative inline-flex items-start pr-4"} key={n.fieldName}>
                                <div className={"flex items-center h-5"}>
                                    <input id={n.fieldName} type={"checkbox"} className={checkboxClasses}
                                           value={n.value} {...register("neighbourhoods", {required: true})} />
                                </div>
                                <div className={"ml-3 text-sm"}>
                                    <label htmlFor={n.fieldName} className={labelClasses}>{n.name}</label>
                                </div>
                            </div>
                        ))}
                        {errors.neighbourhoods && <p className={"text-red-600"}>Please select atleast one neighbourhood</p> }
                    </div>
                </>
            )


        }

        return '';

    }

    //form submission
    const onSubmit = (data) => {

        data = {...data, utmCampaign, utmSource, utmMedium, utmContent, utmTerm}
        data.petFriendly = isPetFriendlyRequired(data.petFriendly);

        //date checks
        const currentDate = moment();
        const parsedMoveIn = moment(data.moveIn);
        if (!parsedMoveIn.isValid()) {
            setError('moveIn', {type: 'custom', message: "move in date does not appear to be valid"});
            return;
        }
        if (parsedMoveIn.diff(currentDate, 'year') > 2) {
            setError('moveIn', {type: 'custom', message: 'Choose a move-in within 2 years of today.'});
            return;
        }

        //prevent double posts
        if (isLoading) {
            return;
        }

        //add any additionalSubmitData to the request that may have been included.
        data = {...additionalSubmitData, ...data};

        //send the request to the api endpoint
        setHasCriticalError(false);
        setIsLoading(true);
        axios.post(submitUrl, data)
            .then(res => {

                setIsLoading(false);

                //if readSubmitResult === true then try to parse out a Salesforce id as that is the default return.
                if (readSubmitResult) {
                    const {id} = res.data?.data || null;
                    if (id != null) {
                        data = {...data, formSubmissionId: id, result: true};
                    }
                }

                //if a stateSetter function is present then set the state.
                if (stateSetter && typeof stateSetter === "function") {
                    stateSetter(data);
                }
                else {
                    console.log('unable to update state.  stateSetter is not a function');
                }

            })
            .catch(error => {
                console.log(error);
                setHasCriticalError(true);
                setCriticalErrorMessage(error?.response?.data?.errorMessage || "Unknown Error");
                setIsLoading(false);
            })
    }

    return (
        <div className={formHolderClasses}>
            {/*loading widget*/}
            <div className={isLoading ? 'block' : 'hidden'}>
                <div className={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} style={{zIndex:500}}>
                    <Image src={"/images/loading.gif"} height={150} width={150} priority={true} />
                </div>
                <div className={"w-full h-full bg-hbLightGray absolute top-0 left-0 opacity-60 z-40"}>

                </div>
            </div>
            {/*form header*/}
            <h3 className={"text-lg font-medium text-gray-900 font-bold"}>Personal Information</h3>
            {/*form*/}
            <form className={formClasses} onSubmit={handleSubmit(onSubmit)}>

                {/*First Name*/}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"firstName"} className={labelClasses}>*First Name</label>
                    <div className={"mt-1"}>
                        <input type={"text"} {...register('firstName', {required: true, maxLength: 50})}
                               className={textInputClasses} title="First Name" />
                        {errors.firstName && <p className={"text-red-600"}>First name is required.</p>}
                    </div>
                </div>

                {/*Last Name*/}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"lastName"} className={labelClasses}>*Last Name</label>
                    <div className={"mt-1"}>
                        <input type={"text"} {...register('lastName', {required: true, maxLength: 50})}
                               className={textInputClasses} title="Last Name" />
                        {errors.lastName && <p className={"text-red-600"}>Last name is required.</p>}
                    </div>
                </div>

                {/*Email Address*/}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"email"} className={labelClasses}>
                        *Email Address
                    </label>
                    <div className={"mt-1"}>
                        <input type={"email"} {...register("emailAddress", {pattern: /\S+@\S+\.\S+/, required: true})} className={textInputClasses} title="Email Address" />
                        {errors.emailAddress && <p className={"text-red-600"}>Email address is not valid.</p>}
                    </div>
                </div>

                {/*Phone Number*/}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"phone"} className={labelClasses}>
                        *Phone Number
                    </label>
                    <div className={"mt-1"}>
                        <input type={"tel"} className={textInputClasses} {...register('phoneNumber', {pattern: /^(0|[1-9]\d*)(\.\d+)?$/,required: true, maxLength: 20, minLength:10})} title="Phone Number" />
                        {errors.phoneNumber && <p className={'text-red-600'}>Valid phone number is required.</p>}
                    </div>
                </div>

                <h3 className={"text-lg font-medium font-bold text-gray-900 col-span-2"}>Preferences</h3>

                {/*Suite Types*/}
                <div className={"col-span-2"}>
                    <label className={labelClasses}>*Suite Types</label>
                </div>
                <div className={"col-span-2"}>
                    {suiteTypeOptions.map(e => (
                        <div className="relative inline-flex items-start pr-4" key={e.name}>
                            <div className="flex items-center h-5">
                                <input id={e.fieldName} name={'suiteTypes'} type="checkbox"
                                       className={checkboxClasses}
                                       value={e.value} {...register("suiteTypes", {required: true})} title="Suite Type"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor={e.fieldName} className={labelClasses}>
                                    {e.name}
                                </label>
                            </div>
                        </div>
                    ))}
                    {errors.suiteTypes && <p className={"text-red-600"}>Please select at minimum one suite type.</p>}
                </div>

                {/* max budget*/}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"max-budget"} className={labelClasses}>*Maximum Budget</label>
                    <div className={"mt-2"}>
                        <input type={"number"} className={textInputClasses} {...register('maxBudget', {required: true, max: 9999, min: 500})} title="Maximum Budget" />
                        {errors.maxBudget && <p className={"text-red-600"}>Max budget must be between 500 and 9999</p>}
                    </div>
                </div>

                {/*move-in date*/}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"move-in"} className={labelClasses}>
                        *Desired Move-in Date
                    </label>
                    <div className={"mt-1 datepicker"}>
                        <Controller render={({ field }) => (
                            <DatePicker selected={field.value} onChange={(date) => field.onChange( date )} dateFormat={"yyyy-MM-dd"} className={textInputClasses} />
                        )} name="moveIn" control={control} rules={{required: true}} />
                        {errors.moveIn && <p className={"text-red-600"}> {errors.moveIn.message ? errors.moveIn.message : 'Move-in is required.'}  </p>}
                    </div>
                </div>

                {/*Pet friendly*/}
                <div className={textInputHolderClasses}>
                    <div className="col-span-2">
                        <label className={labelClasses}>*Pet Friendly Required?</label>
                    </div>
                    <div className="col-span-2">
                        {
                            petFriendlyOptions.map(p => (
                              <div className="relative inline-flex items-start pr-4" key={`pet_${p.value}`}>
                                  <div className="flex items-center h-5">
                                      <input id={`pet_${p.value}`} name="petFriendly" type="radio" title="Pet Friendly" value={p.value} {...register('petFriendly', {required: true})} />
                                  </div>
                                  <div className="ml-3 text-sm">
                                      <label htmlFor={`pet_${p.value}`}>{p.label}</label>
                                  </div>
                              </div>
                            ))
                        }
                        {errors.petFriendly && <p className="text-red-600">Please select pet friendly requirements.</p>}
                    </div>
                </div>

                {/*Number of Occupants*/}
                <div className={textInputHolderClasses}>
                    <label htmlFor={"occupants"} className={labelClasses}>Number Of Occupants</label>
                    <div>
                        <select id={"occupants"} name={"occupants"} className={textInputClasses} {...register('numberOfOccupants', {required: true})} title="Number of Occupants">
                            {occupantOptions.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                        {errors.numberOfOccupants && <p className={"text-red-600"}>Number of occupants is required.</p>}
                    </div>
                </div>

                {/*City Interest*/}
                <div className={"col-span-2"}>
                    <label className={labelClasses}>Interested Cities</label>
                </div>
                <div className={"col-span-2"}>
                    {cityOptions.map(city => (
                        <div className={"relative inline-flex items-start pr-4"} key={city.fieldName}>
                            <div className={"flex items-center h-5"}>
                                <input id={city.fieldName} type={"checkbox"} className={checkboxClasses}
                                       value={city.value} {...register("cities", {required: true})} />
                            </div>
                            <div className={"ml-3 text-sm"}>
                                <label htmlFor={city.fieldName} className={labelClasses}>{city.name}</label>
                            </div>
                        </div>
                    ))}
                    {errors.cities && <p className={"text-red-600"}>Please select at minimum one city</p> }
                </div>

                {/*Neighbourhoods*/}
                <NeighbourhoodOptions control={control} />

                {/*Critical Error*/}
                {
                    hasCriticalError &&
                    <div className={"col-span-2"}>
                        <div className="rounded-md bg-red-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <XCircleIcon className="h-7 w-7 text-white" aria-hidden="true" />
                                </div>
                                <div className="ml-3 flex-1 md:flex md:justify-between text-center">
                                    <p className={"text-white"}>{criticalErrorMessage}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                }

                {/*Submit button*/}
                <div className={"sm:col-span-2 sm:flex sm:justify-end"}>
                    {showBack && handleBackButton &&
                        <button type="button" className={`${buttonClasses} mr-1`} onClick={event => handleBackButton(event)} >Back</button>

                    }
                    {
                        showCancel && handleCancelButton &&
                        <button type="button" className={`${cancelButtonTailwindClasses} mr-1`} onClick={event => handleCancelButton(event)}>Cancel</button>
                    }
                    <button type={"submit"} className={buttonClasses}>
                        {buttonText}
                    </button>
                </div>

            </form>
        </div>
    )
}
