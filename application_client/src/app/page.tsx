"use client";

import React from "react";
import {useRouter} from "next/navigation";
import Image from 'next/image';
import logo from "@/public/title/title.png"
import './main/start/style.scss';


export default function Start() {

    const router = useRouter();

    const handleRouting=()=>{
        setTimeout(() => {
            router.push("/auth/login");
        }, 0);
    };
    return (
        <div className="Start" onClick={handleRouting}>
            <Image src={logo} alt="error" className="logo"/>
        </div>
    )
}