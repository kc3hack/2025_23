"use client"

import React from "react";
import Image from 'next/image';
import logo from "@/public/logo.png"
import styles from "./style.module.scss";
import Link from "next/link";
import axios from "axios";

import path from "@/api/dbserver_endpoint_path";


const Header = () => {

    const handleLogout = async () => {
        try {
            const response = await axios.post(path+'/logout',{withCredentials: true});
            console.log(response.data.message);
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    };


    return (
        <div className={styles.header}>
            <Image src={logo} alt="error" className={styles.logo}/>
            <div className={styles.settings}>
                <div><Link href="../../main/home">home</Link></div>
                <div><Link href="../../main/settings/favorite">character</Link></div>
                <div><Link href="../../main/start" onClick={handleLogout}>logout</Link></div>
            </div>
        </div>
    );
};

export default Header;