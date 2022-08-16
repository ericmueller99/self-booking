import React from "react";

export default function HeroImage ({imageClass = 'bg-bookingBanner'}) {
    const classes = `py-44 lg:py-60 2xl:py-72 w-full bg-cover relative text-white ${imageClass} lg:bg-right`
    return (
        <section className="absolute top-0 h-44 w-full">
            <div className={classes}>
                <div className="relative h-full"></div>
            </div>
        </section>
    )
}