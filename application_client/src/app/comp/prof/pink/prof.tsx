'use client'

import React from 'react';
import Link from 'next/link';
import Header from '@/app/comp/header/header';
import Image from 'next/image';
import styles from "./style.module.scss";
import '@splidejs/splide/css';
import { Splide, SplideSlide } from 'splide-nextjs/react-splide';
import logo from '@/public/person/pink/穂谷 希愛 立ち絵.jpg';
import logo2 from '@/public/person/gold/29ff73c69abaf642.jpg';
import {Character_idAtom} from "@/global/favorite/jotai";
import profile from "@/global/person/pink/string";
import {useAtom} from "jotai/index";
import {useRouter} from "next/navigation";
import axios from "axios";

import path from "@/api/dbserver_endpoint_path";

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
                character_id: 1,
            };
            const response = await axios.put(path+'/character_id_put', submitData, {withCredentials: true});

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
        setCharacterid(1);
        handleSubmitCharacter_idChange();
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
