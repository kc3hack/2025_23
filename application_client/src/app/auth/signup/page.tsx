'use client';

import Link from "next/link";
import logo from "@/public/logo.png"
import Image from "next/image";
import { useAtom } from 'jotai';
import './style.scss';

import {nicknameAtom, passwordAtom} from "@/global/auth/jotai";
import {usernameAtom} from "@/global/auth/jotai";

import axios from "axios";
import {useRouter} from "next/navigation";

import path from "@/api/dbserver_endpoint_path";
import {useState} from "react";

export default function New() {

    const [username, setUsername] = useAtom(usernameAtom);
    const [password, setPassword] = useAtom(passwordAtom);
    const [nickname,setNickname] = useAtom(nicknameAtom);

    const [error,setError]=useState("");

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }


    const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    }

    const handleChangeNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(e.target.value);
    }


    const router = useRouter();
    const handleRouting=()=>{
        setTimeout(() => {
            router.push("../../main/start");
        }, 0);
    };

    const handleSubmit = async () => {

        if (!username || !password || !nickname) {
            setError("すべてのフォームを入力してください")
            return;
        }

        try {
            const submitData = { User_name: username, pwd: password , nickname:nickname ,character_id:0};

            const response = await axios.post(path+'/signup', submitData,{withCredentials: true});
            if (response.data && response.data.message === 'Login successful') {
                handleRouting();
            }
        } catch (err) {
            console.error('Error:', err);
            setError("このユーザー名は既に使用されています。");
        }
    };



    return (
        <div className="new1">

            <Image src={logo} alt="error" className="logo"></Image>
            <div className="login-tag">
                <p>Sign Up</p>
            </div>
            <div className="main">
                <input
                    className="up"
                    value={username}
                    onChange={handleChangeUsername}
                    placeholder="Enter username"
                />

                <input
                    className="middle-textarea"
                    value={nickname}
                    onChange={handleChangeNickname}
                    placeholder="Nickname"
                />

                <input
                    className="down"
                    type="password"
                    value={password}
                    onChange={handleChangePassword}
                    placeholder="Password"
                />
                <p className="error">{error}</p>

                <button onClick={handleSubmit}>Sign Up</button>

                <p>アカウントをお持ちの方<Link href="../../auth/login" className="link">こちら</Link></p>
            </div>
        </div>
    );
}