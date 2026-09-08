import React from "react";

const footerLinks = [
    {type: "learnMore", name: "About Us", link: "https://www.hollyburn.com/about-us/"},
    {type: "learnMore", name: "Commercial", link: "https://www.hollyburn.com/about-us/commercial/"},
    {type: "learnMore", name: "Community", link: "https://www.hollyburn.com/community/"},
    {type: "learnMore", name: "Developments", link: "https://www.hollyburn.com/developments/"},
    {type: "learnMore", name: "Hollyburn Perks", link: "https://www.hollyburn.com/hollyburn-perks/"},
    {type: "learnMore", name: "Promotions", link: "https://www.hollyburn.com/promotions/"},
    {type: "learnMore", name: "Rental Process", link: "https://www.hollyburn.com/rental-process/"},
    {type: "learnMore", name: "Policies", link: "https://www.hollyburn.com/policies/"},
    {type: "learnMore", name: "Press / Media", link: "https://www.hollyburn.com/press-media/"},
    {type: "learnMore", name: "Blog", link: "https://www.hollyburn.com/blog/"},
    {type: "learnMore", name: "Careers", link: "https://www.hollyburn.com/careers/"},
    {type: "learnMore", name: "Contact", link: "https://www.hollyburn.com/contact/"},
    {type: "vancouverApartmentRentals", name: "Downtown West End Apartments", link: "https://www.hollyburn.com/vancouver/downtown-vancouver/west-end/"},
    {type: "vancouverApartmentRentals", name: "Kitsilano Apartments", link: "https://www.hollyburn.com/vancouver/vancouver-west-side/kitsilano/"},
    {type: "vancouverApartmentRentals", name: "Oakridge Apartments", link: "https://www.hollyburn.com/vancouver/vancouver-west-side/oakridge/"},
    {type: "vancouverApartmentRentals", name: "South Granville Apartments", link: "https://www.hollyburn.com/vancouver/vancouver-west-side/south-granville/"},
    {type: "vancouverApartmentRentals", name: "North Vancouver Apartments", link: "https://www.hollyburn.com/vancouver/north-shore/"},
    {type: "vancouverApartmentRentals", name: "West Vancouver Apartments", link: "https://www.hollyburn.com/vancouver/north-shore/west-vancouver/"},
    {type: "vancouverApartmentRentals", name: "UBC Apartments", link: "https://www.hollyburn.com/vancouver/vancouver-west-side/ubc/"},
    {type: "torontoApartmentRentals", name: "The Annex Apartments", link: "https://www.hollyburn.com/toronto/the-annex/"},
    {type: "torontoApartmentRentals", name: "Downtown Toronto Apartments", link: "https://www.hollyburn.com/toronto/downtown-toronto/"},
    {type: "torontoApartmentRentals", name: "Etobicoke Apartments", link: "https://www.hollyburn.com/toronto/etobicoke-2/"},
]

export function Footer({showHero = true}) {
    const footerHero = showHero ? "block" : "hidden";
    return (
        <>
            <section className={footerHero}>
                <div className={"lg:py-24 w-full bg-cover relative text-white bg-footerHero lg:bg-right"}>
                    <div className={"relative h-full"}>
                        <div className={"lg:px-20 py-20 w-full flex flex-row"}>
                            <div className={"hidden lg:basis-2/4 lg:flex"}></div>
                            <div className={"px-10 lg:basis-2/4"}>
                                <h2 className={"text-white font-medium text-lg pb-5"}>Find Your Next Apartment</h2>
                                <p>You’ve picked your city. You have a budget. And you’re ready to explore available apartments for rent. Starting your apartment search
                                    with Hollyburn is a great way to find an apartment rental you’re guaranteed to love!
                                </p>
                                <div className={"py-5 mt-5"}>
                                    <a href={"https://www.hollyburn.com/find-an-apartment"}
                                       className={"border-4 border-hbOrange p-5 rounded hover:transition hover:bg-hbOrangeHover hover:border-hbOrangeHover hover:text-black duration-300"}
                                       target="_blank" rel="noreferrer">Find an Apartment</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <footer style={{fontSize:'14px', fontWeight: '400', lineHeight: '1.7142857143', fontStyle: 'normal'}}>
                <div className={"w-full text-hbGray"} style={{backgroundColor: '#ebebeb'}}>
                    <div className={"bg-cover relative mx-auto p-5 lg:px-8 2xl:mx-24"} style={{backgroundImage: "url(/images/footer-img-bottom.jpg"}}>
                        <div className={"block lg:flex flex-row lg:px-4 xl:px-12 pt-10 pb-5 lg:py-20"}>
                            <div className={"flex lg:basis-1/4 xl:basis-1/4 2xl:basis-1/3 flex-col"}>
                                <h3 className={"hbFooterHeadings"}>Learn More</h3>
                                <div className={"py-10"}>
                                    <ul>
                                        {footerLinks.filter(e => e.type === 'learnMore').map(f => (
                                            <li key={f.name} className={"py-0.5"}>
                                                <a href={f.link} target={"_blank"} rel="noreferrer">{f.name}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className={"hidden lg:flex basis-1/3 lg:basis-1/4 flex-col"}>
                                <h4 className={"hbFooterHeadings"}>Locations</h4>

                                <div className={"py-10"}>
                                    <h4 className={"hbFooterSubHeadings mb-4"}>
                                        <a href={"https://www.hollyburn.com/vancouver/"} target={"_blank"} rel="noreferrer">Vancouver Apartment Rentals</a>
                                    </h4>
                                    <ul>
                                        {footerLinks.filter(e => e.type === 'vancouverApartmentRentals').map(m => (
                                            <li key={m.name} className={"py-0.5"}>
                                                <a href={m.link} target={"_blank"} rel="noreferrer">{m.name}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={"py-2"}>
                                    <h4 className={"hbFooterSubHeadings mb-4"}>
                                        <a href={"https://www.hollyburn.com/toronto/"} target={"_blank"} rel="noreferrer">
                                            Toronto Apartment Rentals
                                        </a>
                                    </h4>
                                    <ul>
                                        {footerLinks.filter(e => e.type === 'torontoApartmentRentals').map(m => (
                                            <li key={m.name} className={"py-0.5"}>
                                                <a href={m.link} target={"_blank"} rel="noreferrer">{m.name}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={"py-2"}>
                                    <h4 className={"hbFooterSubHeadings"}>
                                        <a href={"https://www.hollyburn.com/calgary"}>Calgary Rentals</a>
                                    </h4>
                                    <h4 className={"hbFooterSubHeadings mt-2"}>
                                        <a href={"https://www.hollyburn.com/ottawa"}>Ottawa Rentals</a>
                                    </h4>
                                </div>

                            </div>
                            <div className={"flex basis-1/3 lg:basis-2/4 lg:pl-14 flex-col"}>
                                <h4 className={"hbFooterHeadings"}>Get Alerts on New Hollyburn Apartments for Rent</h4>
                                <p className={"py-10"}>
                                    Join our waitlist and be the first to know when new rental listings come available. Simply select your city
                                    (Vancouver, Toronto, Calgary, or Ottawa), your neighbourhood, and your budget range to start receiving email notifications today. &nbsp;
                                    <strong>
                                        With 5,000+ apartment rentals, we’re sure to have a home you’ll love!
                                    </strong>
                                </p>
                                <div>
                                    <a href={"https://www.hollyburn.com#mailing_form"} target={"_blank"} rel="noreferrer" className={"rounded hover:bg-hbOrangeHover bg-hbOrange p-4"}
                                       style={{textDecoration: "none", textAlign: "center", fontWeight: 500}}>Subscribe Now</a>
                                </div>
                            </div>
                        </div>
                        <div className={"border-t border-t-footerBorder lg-6 2xl:mx-12"}>
                            <div className={"lg:flex lg:flex-row"}>

                                <div className={"flex flex-col basis-1/2 pt-2 text-left text-fontGray"}>
                                    <div className={"block lg:inline-block space-x-3 sm:py-2 xl:py-5 text-sm"}>
                                        <a href={"https://www.hollyburn.com/privacy-policy/"} target={"_blank"} rel="noreferrer">Privacy Policy</a>
                                        <a href={"https://www.hollyburn.com/sitemap/"} target={"_blank"} rel="noreferrer">Sitemap</a>
                                        <a href={"https://www.hollyburn.com/legal-disclaimer/"} target={"_blank"} rel="noreferrer">Legal Disclaimer</a>
                                        <a href={"https://hollyburn.laundroworks.com/"} target={"_blank"} rel="noreferrer">Laundry</a>
                                    </div>
                                </div>
                                <div className={"flex flex-col basis-1/2 pt-2 text-left lg:text-right text-hbGray"}>
                                    <div className={"xl:pt-5 pt-2 text-lg"}>
                                        2022 Hollyburn Properties.  All rights reserved.
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}