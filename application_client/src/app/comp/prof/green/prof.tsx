'use client'

import React from 'react';
import Image from 'next/image';


import styles from "./style.module.scss";
import '@splidejs/splide/css';
import logo from '@/public/person/green/伏見 瞳華 立ち絵.jpg';
import {Character_idAtom} from "@/global/favorite/jotai";
import profile from "@/global/person/green/string";
import {useAtom} from "jotai/index";
import {useRouter} from "next/navigation";

import axios from "axios";
import path from "@/api/dbserver_endpoint_path";


const useProf=()=>{

    const [, setCharacterid] = useAtom(Character_idAtom);

    const router = useRouter();
    const handleRouting=()=>{
        setTimeout(() => {
            router.push("../../main/home");
        }, 0);
    };

    const handleSubmitCharacter_idChange= async ()=> {
        try {
            const submitData = {
                character_id: 3,
            };
            const response = await axios.put(path+'/character_id_put', submitData, {withCredentials: true});

            if (response.status === 200) {
            }
        } catch{
        }
    }


    const handleCharacter_idChange=()=>{
        handleSubmitCharacter_idChange();
        setCharacterid(3);
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
                        <button onClick={handleCharacter_idChange}>この娘と話す</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default useProf;
