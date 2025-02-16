'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { LoginIdType } from "@/type/loginIdType";
import logo from "@/public/logo.png"
import Image from "next/image";
import { useAtom } from 'jotai';
import {passwordAtom} from "@/global/auth/jotai";
import {usernameAtom} from "@/global/auth/jotai";

export default function New() {

    const [username, setUsername] = useAtom(usernameAtom);
    const [password, setPassword] = useAtom(passwordAtom);

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        console.log(password);
    }


    const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        console.log(username);
    }


    return (
        <div className="new">

            <Image src={logo} alt="error" className="logo"></Image>
            <div className="login-tag">
                <p>Sign Up</p>
            </div>
            <div className="main">
                <textarea
                    className="up"
                    value={username}
                    onChange={handleChangeUsername}
                    placeholder="Enter username"
                />

                <textarea
                    className="down"
                    value={password}
                    onChange={handleChangePassword}
                    placeholder="Password"
                />

                <button>Sign Up</button>

                <p>アカウントをお持ちの方<Link href="../new" className="link">こちら</Link></p>
            </div>
        </div>
    );
}