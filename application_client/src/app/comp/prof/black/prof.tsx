'use client'

import React, {useState} from 'react';
import Link from 'next/link';
import Header from '@/app/comp/header/header';
import Image from 'next/image';
import styles from "./style.module.scss";
import '@splidejs/splide/css';
import { Splide, SplideSlide } from 'splide-nextjs/react-splide';
import logo from '@/public/person/black/夜久野 怜狐 立ち絵.png';
import logo2 from '@/public/person/gold/29ff73c69abaf642.jpg';
import {Character_idAtom} from "@/global/favorite/jotai";

import profile from "@/global/person/black/string";
import {useAtom} from "jotai";
import {useRouter} from "next/navigation";
import axios from "axios";


const prof=()=>{

    const [characterid, setCharacterid] = useAtom(Character_idAtom);

    const router = useRouter();
    const handleRouting=()=>{
        setTimeout(() => {
            router.push("../../main/home");
        }, 0);
    };

    const handleSubmitCharacter_idChange= async ()=> {
        try {
            const submitData = {
                character_id: 2,
            };
            const response = await axios.put('http://localhost:5000/character_id_put', submitData, {withCredentials: true});

            if (response.status === 200) {
                console.log(response);
                console.log(1);
            } else {
                console.log(0);
            }
        } catch{
            console.log(0);
        }
    }

    const handleCharacter_idChange=()=>{
        handleSubmitCharacter_idChange();
        setCharacterid(2);
        handleRouting();
    }

    return(
        <div className={styles.prof}>
            <div className={styles.container}>
                <div className={styles.container2}>
                    <Image src={logo} alt="error" className={styles.logo}></Image>
                    <div className={styles.introduction}>
                        <div className={styles.name}><p>{profile.name}</p></div>
                        <div className={styles.sentence}><p>{profile.sentence}</p></div>
                        <button onClick={handleCharacter_idChange}>set</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default prof;
