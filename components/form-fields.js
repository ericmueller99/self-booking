import React from "react";
import Image from "next/image";
import {formatDateMMMD, slimButtonTailwindClasses, suiteTypeMapper} from "../lib/form-helpers";
import {InformationCircleIcon, XCircleIcon} from "@heroicons/react/solid";

export const PropertySelectWithOptGroup = ({register, propertyOptions, tailwindClasses}) => {
    return (<select className={tailwindClasses} {...register('property', {required: "Please select a property."})}
                    defaultValue={"Please Select..."}>
        <option value={"Please Select..."} disabled>Please Select...</option>
        {propertyOptions.map(p => {
            return (<optgroup label={p.optGroup} key={p.optGroup}>
                {p.data.map(d => (<option value={d.value} key={d.value}>{d.label}</option>))}
            </optgroup>)
        })}
    </select>)
}

export const AvailableSuites = ({
                                    register,
                                    suiteOptions,
                                    suiteWatch,
                                    availableSuiteHolderClasses,
                                    hbOrangeButton,
                                    options = {}
                                }) => {

    const {
        headerText = 'Choose suites that match your preference.',
        infoText = '(Up to a maximum of 3 suites)',
        useNoSelfBookingFlag = false,
    } = options;

    //if there are no suite options then return early
    if (!suiteOptions || suiteOptions.length === 0) {
        return '';
    }

    console.log(suiteOptions);
    console.log(suiteWatch);

    let suiteWatchCleaned = suiteWatch || [];
    if (!Array.isArray(suiteWatchCleaned)) {
        suiteWatchCleaned = [suiteWatchCleaned];
    }
    suiteWatchCleaned = suiteWatchCleaned.map(s => Number(s));

    return (<div className={"col-span-2"}>
        <fieldset>
            <p>
                {headerText}
                {infoText && <>
                    <br/>
                    <span className={"text-xs"}>{infoText}</span>
                </>}
            </p>
            <div className={availableSuiteHolderClasses}>
                {suiteOptions.map(s => (<div
                        className={`${suiteWatchCleaned.length > 2 && !suiteWatchCleaned.includes(s.vacancyId) ? 'cursor-not-allowed' : ''} relative bg-white border rounded-md shadow-xl p-4 flex focus:outline-none ${suiteWatchCleaned.includes(s.vacancyId) ? 'border border-hbBlue' : ''}`}
                        key={s.vacancyId}>
                        <input type="checkbox" id={`${s.vacancyId}-suite`} name="suites" value={s.vacancyId}
                               className={"sr-only"} {...register('suites', {required: 'Please select atleast one suite'})}
                               disabled={suiteWatchCleaned.length > 2 && !suiteWatchCleaned.includes(s.vacancyId) ? true : false}/>
                        <span className={"flex-1 flex"}>
                                      {/*Image*/}
                            <span className="flex flex-none basis-1/2 pr-5">
                                          {s.images[0] && <span className="relative w-full h-full">
                                                  <Image src={s.images[0]} alt={`${s.unitNumber} Image`} layout="fill"/>
                                              </span>}
                                {!s.images[0] && <span className="relative w-full h-full">
                                                  <Image src="/images/no-image.jpg" alt="Image not available"
                                                         layout="fill" width={100} height={100}/>
                                              </span>}
                                      </span>
                                        <span className="md:flex md:flex-none md:basis-1/2">
                                            <span className={"flex flex-col gap-y-2"}>
                                              <span
                                                  className={"block text-xl font-medium text-hbGray"}>{s.unitNumber} {suiteTypeMapper(s.bedrooms)}</span>
                                                <span
                                                    className={"block text-lg font-medium text-hbLightGrayText"}>Available {formatDateMMMD(s.availableDate)} from</span>
                                                <span
                                                    className={"block text-xl font-medium text-hbGray"}>${s.askingRent} monthly</span>
                                                <span
                                                    className={"block text-xs text-gray-900"}>{s.features && s.features.length > 0 ? `${s.features.toString().replace(/,/g, ', ')},` : ''} {s.flooring}, {s.countertops}</span>
                                                <span className="block justify-end">
                                                  {useNoSelfBookingFlag === true && s.noSelfBookings === true &&
                                                      <p className="text-xs font-medium text-gray-900">Unavailable for
                                                          self-booking. Please call a rental advisor to book a
                                                          viewing.</p>

                                                  }
                                                    {!s.noSelfBookings && <label htmlFor={`${s.vacancyId}-suite`}
                                                                                 className={hbOrangeButton}>
                                                        {suiteWatchCleaned.includes(s.vacancyId) ? 'Selected' : 'Select'}
                                                    </label>}

                                                </span>
                                            </span>
                                        </span>
                                    </span>
                    </div>))}
            </div>
        </fieldset>
    </div>)
}

export const InvalidVacancyOrPropertyLink = ({text, handleDismissClick, options = {}}) => {

    const {
        iconHolderClasses = 'hidden md:flex-shrink-0 md:items-center md:flex',
        buttonClasses = slimButtonTailwindClasses()
    } = options;

    return (<div className={"col-span-2"}>
        <div className="rounded-md bg-white p-4 border border-red-700">
            <div className="flex">
                <div className={iconHolderClasses}>
                    <InformationCircleIcon className="h-5 w-5 text-red-700" aria-hidden="true"/>
                </div>
                <div className="flex-1 flex justify-between items-center space-y-2">
                    <p className="flex items-center ml-1">{text}</p>
                    <button type="button" className={buttonClasses}
                            onClick={event => handleDismissClick(event)}>Dismiss
                    </button>
                </div>
            </div>
        </div>
    </div>)
}

export const UpdatePreferenceBanner = ({handleUpdatePrefs, options = {}}) => {

    const {
        iconHolderClasses = 'hidden md:flex-shrink-0 md:items-center md:flex',
        buttonClasses = slimButtonTailwindClasses()
    } = options;

    return (<div className={"col-span-2"}>
        <div className="rounded-md bg-white p-4 border border-gray-300">
            <div className="flex">
                <div className={iconHolderClasses}>
                    <InformationCircleIcon className="h-5 w-5 text-hbBlue" aria-hidden="true"/>
                </div>
                <div className="flex-1 flex justify-between items-center space-y-2">
                    <p className="flex items-center ml-1">Not seeing what you need?</p>
                    <p className="flex items-center">
                        <button type="button" className={buttonClasses} onClick={event => handleUpdatePrefs(event)}>
                            Update Preferences
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>)
}

//radio button for whether preferences should be used
export const VacancyDisplayType = ({register}) => {
    return (<div className={"col-span-2 sm:col-span-1"}>
        <fieldset>
            <label htmlFor={"vacancy-display-type"} className={"block text-sm font-medium text-hbGray mb-3"}>Filter
                based on preferences?</label>
        </fieldset>
        <div className={"relative inline-flex items-start pr-4"}>
            <div className={"flex items-center h-5"}>
                <input id={'vacancy-display-yes'} type={"radio"}
                       className={"focus:ring-hbBlue h-4 w-4 text-hbBlue border-gray-300 rounded"}
                       value={'yes'} {...register("vacancyDisplayType")} />
            </div>
            <div className={"ml-3 text-sm"}>
                <label htmlFor={'vacancy-display-yes'} className={"font-medium text-gray-700"}>Yes</label>
            </div>
        </div>
        <div className={"relative inline-flex items-start pr-4"}>
            <div className={"flex items-center h-5"}>
                <input id={'vacancy-display-no'} type={"radio"}
                       className={"focus:ring-hbBlue h-4 w-4 text-hbBlue border-gray-300 rounded"}
                       value={'no'} {...register("vacancyDisplayType")} />
            </div>
            <div className={"ml-3 text-sm"}>
                <label htmlFor={'vacancy-display-no'} className={"font-medium text-gray-700"}>No</label>
            </div>
        </div>
    </div>)
}

//form errors control.  Displays all errors on a form.
export const FormErrors = ({errors}) => {

    if (!errors || Object.keys(errors).length === 0) {
        return '';
    }

    return (<div className="col-span-2 mt-4">
        <div className="rounded-md bg-red-400 p-4">
            <div className="flex">
                <div className="flex-shrink-0 items-center flex">
                    <XCircleIcon className="h-7 w-7 text-white" aria-hidden="true"/>
                </div>
                {Object.keys(errors).map(key => (
                    <div className="ml-3 flex-1 md:flex md:justify-between text-center" key={key}>
                        <p className={"text-white"}>{errors[key].message}</p>
                    </div>))}
            </div>
        </div>
    </div>)

}