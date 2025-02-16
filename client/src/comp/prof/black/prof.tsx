import React from 'react';
import Link from 'next/link';
import Header from '@/comp/header/header';
import Image from 'next/image';
import styles from "./style.module.scss";
import '@splidejs/splide/css';
import { Splide, SplideSlide } from 'splide-nextjs/react-splide';
import logo from '@/public/person/black/seikaku_tachi.jpg';
import logo2 from '@/public/person/gold/29ff73c69abaf642.jpg';

import profile from "@/global/person/black/string";


const prof=()=>{
    return(
        <div className={styles.prof}>
            <div className={styles.container}>
                <div className={styles.container2}>
                    <Image src={logo} alt="error" className={styles.logo}></Image>
                    <div className={styles.introduction}>
                        <div className={styles.name}><p>{profile.name}</p></div>
                        <div className={styles.sentence}><p>{profile.sentence}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default prof;
