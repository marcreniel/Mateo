"use client";

import React from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar} from "@nextui-org/react";
import Image from 'next/image'
import useSupabaseClient from "@/utils/supabase/client";
import { useRouter } from 'next/navigation'

export default function Navigation(props: any) {
    // Initialize the clients and router and get the user session
    const { email, name, avatar } = props.props;

    console.log(email, name, avatar);

    const supabase = useSupabaseClient();
    const router = useRouter();

    async function signOut() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    return (
        <Navbar>
            <NavbarBrand>
                <Image src="/logo.png" alt="Mateo" width={100} height={100} />
            </NavbarBrand>

            <NavbarContent as="div" justify="end">
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <Avatar
                            isBordered
                            as="button"
                            className="transition-transform"
                            color="secondary"
                            name={name}
                            size="sm"
                            src={avatar}
                        />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Profile Actions" variant="flat">
                        <DropdownItem key="profile" className="h-14 gap-2">
                            <p className="font-semibold">Signed in as {name}</p>
                            <p className="font-light">{email}</p>
                        </DropdownItem>
                        <DropdownItem key="settings">My Settings</DropdownItem>
                        <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
                        <DropdownItem onClick={signOut} key="logout" color="danger">
                            Log Out
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </NavbarContent>
        </Navbar>
    );
}
