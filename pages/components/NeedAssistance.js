import React from "react";

export default function NeedAssistance() {
    return (
        <div className="py-24 bg-white sm:py-32">
            <div className="max-w-md mx-auto pl-4 pr-8 sm:max-w-lg sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-4xl leading-10 font-extrabold tracking-tight text-gray-900 text-center sm:text-5xl sm:leading-none lg:text-6xl">
                    Need Assistance
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-xl leading-normal text-gray-500 text-center">
                    If you are having trouble or would like some additional assistance making your booking please call or email our Rental Advisor team at:
                </p>
                <dl className="mt-6 max-w-3xl mx-auto text-sm leading-normal text-gray-500 text-center">
                    <dd><span className="font-bold">Vancouver/Calgary: </span>604-369-4725</dd>
                    <dd><span className="font-bold">Toronto/Ottawa: </span> 436-888-8958</dd>
                    <dd><span className="font-bold">Email: </span> rent@hollyburn.com</dd>
                </dl>
            </div>
        </div>
    )
}