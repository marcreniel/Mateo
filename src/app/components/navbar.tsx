"use client";

import React from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar} from "@nextui-org/react";
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Navigation() {
    const router = useRouter();

    function login(){
        router.push('/login')
    }

    return (
        <Navbar isBlurred={false} className="bg-transparent">
            <NavbarBrand>
                <Image className="cursor-pointer" onClick={() => location.reload()} src="/logo.svg" alt="Mateo" width={75} height={75} />
            </NavbarBrand>
            {/* <TestEmail/> */}
            <NavbarContent as="div" justify="end">
                <button onClick={() => login()}className="px-6 py-2 rounded-full bg-gradient-to-b from-harvest-gold-600 to-harvest-gold-800 text-white focus:ring-2 focus:ring-harvest-gold-400 hover:shadow-xl transition duration-200">
                Sign In
                </button>
            </NavbarContent>
        </Navbar>
    );
}
