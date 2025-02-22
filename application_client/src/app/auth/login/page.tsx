'use client';

import Link from "next/link";
import './style.scss';
import logo from "@/public/logo.png"
import Image from "next/image";
import { useAtom } from 'jotai';
import {passwordAtom} from "@/global/auth/jotai";
import {usernameAtom} from "@/global/auth/jotai";
import axios from "axios";
import {useRouter} from "next/navigation";
import path from "@/api/dbserver_endpoint_path";
import {useEffect, useState} from "react";



export default function Login() {

    const [username, setUsername] = useAtom(usernameAtom);
    const [password, setPassword] = useAtom(passwordAtom);

    const [error,setError]=useState("");

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
            router.push("../../main/home");
        }, 0);
    };



    const handleSubmit = async () => {

        if (!username || !password) {
            console.log("loginに失敗しました。")
            return;
        }

        try {
            const submitData = { User_name: username, pwd: password };
            const response = await axios.post(path+'/login', submitData,{withCredentials: true});

            if (response.data && response.data.message === 'Login successful') {
                console.log('ログイン成功:', response.data);
                handleRouting();
            } else {
                console.log("loginに失敗しました");
            }
        } catch {
            setError("ユーザ名かパスワードが間違っています");
        }
    };

    useEffect(() => {
        localStorage.clear();
    }, []);


    return (
        <div className="new">
            <button onClick={handleRouting}>fdsa</button>
            <Image src={logo} alt="error" className="logo"></Image>
            <div className="login-tag">
                <p>Sign In</p>
            </div>
            <div className="main">
                <input
                    className="up"
                    value={username}
                    onChange={handleChangeUsername}
                    placeholder="Enter username"
                />

                <input
                    className="down"
                    type="password"
                    value={password}
                    onChange={handleChangePassword}
                    placeholder="Password"
                />
                <p>{error}</p>

                <button onClick={handleSubmit}>Sign In</button>

                <p>アカウントをお持ちでない方は<Link href="../../auth/signup" className="link">こちら</Link></p>
            </div>
        </div>
    );
}