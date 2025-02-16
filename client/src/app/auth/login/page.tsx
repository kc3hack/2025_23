'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import './style.scss';
import type { LoginIdType } from "@/type/loginIdType";
import logo from "@/public/logo.png"
import Image from "next/image";
import {useAtom} from "jotai/react/useAtom";
import {passwordAtom} from "@/global/auth/jotai";
import {usernameAtom} from "@/global/auth/jotai";



export default function Login() {

    const [loginId, setLoginId] = useState<LoginIdType>({ username: '', password: '' });

    const handleUsernameChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    {
        setLoginId({
            ...loginId,
            username: e.target.value,
        });

        console.log(loginId);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    {
        setLoginId({
            ...loginId,
            password: e.target.value,
        });
        console.log(loginId);
    };


    return (
        <div className="new">

            <Image src={logo} alt="error" className="logo"></Image>
            <div className="login-tag">
                <p>Sign In</p>
            </div>
            <div className="main">
                <textarea
                    className="up"
                    value={loginId.username}
                    onChange={handleUsernameChange}
                    placeholder="Enter username"
                />

                <textarea
                    className="down"
                    value={loginId.password}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                />

                <button>Sign In</button>

                <p>アカウントをお持ちでない方は<Link href="../new" className="link">こちら</Link></p>
            </div>
        </div>
    );
}