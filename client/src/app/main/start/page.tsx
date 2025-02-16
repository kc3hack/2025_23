import React from "react";
import {useRouter} from "next/navigation";
import Image from 'next/image';
import image from "@/public/person/gold/1de2dd427d7e8af0.png"
import logo from "@/public/logo.png"
import './style.scss';


export default function Start() {

    return (
        <div className="Start">
            <Image src={logo} alt="error" className="logo"/>
            <Image src={image} alt="error" className="image"/>

            <div className="auth">
                <button className="login"></button>
                <button className="signup"></button>
            </div>
        </div>
    )
}