import React from "react";
import Image from 'next/image';
import logo from "@/public/logo.png"
import styles from "./style.module.scss";
import Link from "next/link";

const Header = () => {
    return (
        <div className={styles.header}>
            <Image src={logo} alt="error" className={styles.logo}/>
            <div className={styles.settings}>
                <div><Link href="#">favorite</Link></div>
                <div><Link href="#">settings</Link></div>
                <div><Link href="#">logout</Link></div>
            </div>
        </div>
    );
};

export default Header;