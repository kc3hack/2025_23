'use client'

import React from 'react';
import Link from 'next/link';
import Header from '@/app/comp/header/header';
import Image from 'next/image';
import styles from "./style.module.scss";
import logo from '@/public/person/gold/嵐山 小春 私服.jpg';
import logo2 from '@/public/person/gold/29ff73c69abaf642.jpg';

import profile from "@/global/person/gold/string";
import {useAtom} from "jotai/index";
import {Character_idAtom} from "@/global/favorite/jotai";
import {useRouter} from "next/navigation";

import axios from "axios";
import path from "@/api/endpoint";

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
                character_id: 0,
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
        handleSubmitCharacter_idChange();
        setCharacterid(0);
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
