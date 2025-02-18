'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { LoginIdType } from "@/type/loginIdType";
import logo from "@/public/logo.png"
import Image from "next/image";
import { useAtom } from 'jotai';

import {nicknameAtom, passwordAtom} from "@/global/auth/jotai";
import {usernameAtom} from "@/global/auth/jotai";
import  {Character_idAtom} from "@/global/favorite/jotai";
import axios from "axios";
import {useRouter} from "next/navigation";

export default function New() {

    const [username, setUsername] = useAtom(usernameAtom);
    const [password, setPassword] = useAtom(passwordAtom);
    const [nickname,setNickname] = useAtom(nicknameAtom);

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        console.log(password);
    }


    const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        console.log(username);
    }

    const router = useRouter();
    const handleRouting=()=>{
        setTimeout(() => {
            router.push("../../main/start");
        }, 0);
    };

    const handleSubmit = async () => {

        if (!username || !password || !nickname) {
            console.log("signupに失敗しました。")
            return;
        }

        try {
            const submitData = { User_name: username, pwd: password , nickname:nickname ,character_id:0};

            const response = await axios.post('http://localhost:5000/signup', submitData,{withCredentials: true});
            console.log('登録成功:', response.data);
            if (response.data && response.data.message === 'Login successful') {
                console.log('ログイン成功:', response.data);
                handleRouting();
            } else {
                console.log("loginに失敗しました");
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };



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

                <button onClick={handleSubmit}>Sign Up</button>

                <p>アカウントをお持ちの方<Link href="../../auth/login" className="link">こちら</Link></p>
            </div>
        </div>
    );
}