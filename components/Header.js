import React from 'react';
import {Disclosure, Menu, Transition} from "@headlessui/react";
import Image from "next/image";
import { MenuIcon, XIcon } from '@heroicons/react/outline'

//TODO update this to pull from a CMS / Database instead.
const menuItems = [
    {
        name: "Unfurnished Rentals",
        link: "https://www.hollyburn.com/find-an-apartment/",
        subMenu: [
            {name: "Vancouver", link: "https://www.hollyburn.com/find-an-apartment/?city=Vancouver"},
            {name: "Calgary", link: "https://www.hollyburn.com/find-an-apartment/?city=Calgary"},
            {name: "Toronto", link: "https://www.hollyburn.com/find-an-apartment/?city=Toronto"},
            {name: "Ottawa", link: "https://www.hollyburn.com/find-an-apartment/?city=Ottawa"}
        ]
    },
    {
        name: "Furnished Rentals",
        link: "https://www.hollyburn.com/furnished-rentals/",
        subMenu: [
            {name: "Vancouver", link: "https://www.hollyburn.com/furnished-rentals/"}
        ]
    },
    {
        name: "About Us",
        link: "https://www.hollyburn.com/about-us/",
        subMenu: [
            {name: "About Hollyburn", link: "https://www.hollyburn.com/about-us/"},
            {name: "COVID-19 Policies", link: "https://www.hollyburn.com/covid-19/"}
        ]
    },
    {
        name: "Blog",
        link: "https://www.hollyburn.com/blog/",
    },
    {
        name: "Contact Hollyburn",
        link: "https://www.hollyburn.com/contact/",
    },
    {
        name: "Resident Log In",
        link: "https://residentportal.hollyburn.com/login/",
    }
]

export function Header() {
    return (
        <Disclosure as="nav" className="bg-white shadow">
            {({ open }) => (
                <>

                    {/*Full-size Menu*/}
                    <div className="mx-auto px-4 lg:px-4">
                        <div className="flex justify-between h-24">

                            {/*Hollyburn Logo*/}
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center max-w-md lg:max-w-full">
                                    <div className={"hidden lg:flex"}>
                                        <a href={"https://www.hollyburn.com"}>
                                            <Image src="/images/logo.svg" alt={"Hollyburn Properties"} width={175} height={100} />
                                        </a>
                                    </div>
                                    <div className={"lg:hidden flex"}>
                                        <a href={"https://www.hollyburn.com"}>
                                            <Image src={"/images/logo-badge.svg"} alt={"Hollyburn Properties"} width={75} height={70} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/*center menu*/}
                            <div className={"text-center flex content-center items-center"}>
                                {menuItems.map(e => (
                                    <Menu as={"div"} className={"relative hidden text-hbGray lg:inline-flex hover:border-b-hbOrange hover:border-b-2 p-2 h-10 mx-1 lg:px-1"} key={e.name}>
                                        <Menu.Button>
                                            {
                                                e.subMenu ? e.name :
                                                <a href={e.link} target="_blank" rel="noreferrer">{e.name}</a>
                                            }
                                        </Menu.Button>

                                        {
                                            e.subMenu ?

                                                <Transition>
                                                    <Menu.Items className={"absolute left-0 w-56 mt-10 bg-white text-left p-4 z-50"}>
                                                        {e.subMenu.map(e => (
                                                            <div key={e.name}>
                                                                <a href={e.link} className={"hover:bg-hbLightGray w-full inline-block p-2"}>{e.name}</a>
                                                            </div>
                                                        ))}
                                                    </Menu.Items>
                                                </Transition>

                                                : null

                                        }

                                    </Menu>
                                ))}
                            </div>

                            <div className="hidden lg:ml-6 lg:flex lg:items-center">
                                <a href={"https://www.hollyburn.com/find-an-apartment"} className={"bg-hbOrange hover:bg-hbOrangeHover"} style={{opacity: 1, display: "inline-block", verticalAlign: 'middle', pointerEvents:
                                        'inherit', fontWeight: '500', padding: '.75em 1.5em', borderRadius: '.375rem',
                                    textDecoration: 'none', textAlign: 'center', border: 'none', cursor:'pointer', fontSize: '100%'}} target={"_blank"} rel="noreferrer">
                                    Find an Apartment
                                </a>
                            </div>

                            {/*Mobile menu button*/}
                            <div className="-mr-2 flex items-center lg:hidden">
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>

                        </div>
                    </div>

                    {/*Mobile menu*/}
                    <Disclosure.Panel className="lg:hidden">
                        <div className="pt-2 pb-3 space-y-1">

                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}