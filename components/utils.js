import React from 'react';
import {XCircleIcon} from "@heroicons/react/solid";

export function LoadingWidget({isLoading = false}) {
    return (
        <div className={isLoading ? 'block' : 'hidden'}>
            <div className={"w-full h-full bg-hbLightGray absolute top-0 left-0 opacity-60 z-40"}></div>
            <div className={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} style={{zIndex: 400}}>
                <img src="/images/loading.gif" height="150px" width="150px" alt="Loading..." />
            </div>
        </div>
    )
}

export function ErrorMessage({errorMessage = 'Unknown error occurred.  Please try again.'}) {
    return (
        <div className="col-span-2 mt-4">
            <div className="rounded-md bg-red-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0 items-center flex">
                        <XCircleIcon className="h-7 w-7 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between text-center">
                        <p className={"text-white"}>{errorMessage}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}