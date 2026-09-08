import Image from 'next/image';
import React from "react";

export function ThankYou({message = <>Thank you for your submission!<br />If requested one of our representative will be in touch with you soon.</>}) {

    return (
        <div className={"max-w-6xl m-auto mt-14 text-center"}>
            <Image src="/images/thank-you-keys.png" height={200} width={233} />
            <h1 className={"text-8xl text-hbGray"}>
                Thank you!
            </h1>
            <p className={"pb-16 pt-10 text-center"}>
                {message}
            </p>
            <div className={"py-5 xl:mb-24"}>
                <a href={"https://www.hollyburn.com/find-an-apartment"} className={"border-4 border-hbOrange p-5 rounded hover:transition hover:bg-hbOrangeHover hover:border-hbOrangeHover hover:text-black duration-300"}
                   rel="noreferrer" target={"_blank"}>Find an Apartment</a>
            </div>
        </div>
    )
}