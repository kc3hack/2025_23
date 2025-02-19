'use client'

import React, {useEffect} from "react";
import {useState} from "react";
import Header from "@/app/comp/header/header";
import './style.scss';
import Image from "next/image";

import { useAtom } from 'jotai';
import {Character_idAtom} from "@/global/favorite/jotai";

import profilego from "@/global/person/gold/string"
import profilepi from "@/global/person/pink/string";
import profilebl from "@/global/person/black/string";
import profilegr from "@/global/person/green/string";

import imagego from "@/public/person/gold/嵐山 小春 昼.jpg";
import imagepi from "@/public/person/pink/穂谷 希愛 朝.jpg";
import imagebl from "@/public/person/black/夜久野 怜狐 昼.png";
import imagegr from "@/public/person/green/伏見 瞳華 昼.jpg"
import axios from "axios";

import path from "@/api/endpoint";

export default function Home() {

    const [name, setName] = useState("");
    const [sentence, setSentence] = useState("");
    const [image, setImage] = useState(imagego);

    const [characterId, setCharacterId] = useAtom(Character_idAtom);

    const recieveData=async () => {
        const response = await axios.get(path+'/character_id_get',{withCredentials:true});
        const response_character_id = response.data.data.character_id;
        setCharacterId(response_character_id);
        console.log("unde",response.data.data.character_id);
    }

    useEffect(() => {
        recieveData();
    }, []);

    useEffect(() => {
        if (characterId == 0) {
            setName(profilego.name);
            setSentence(profilego.sentence);
            setImage(imagego);

        } else if (characterId == 1) {
            setName(profilepi.name);
            setSentence(profilepi.sentence);
            setImage(imagepi);

        } else if (characterId == 2) {
            setName(profilebl.name);
            setSentence(profilebl.sentence);
            setImage(imagebl)

        } else if (characterId == 3) {
            setName(profilegr.name);
            setSentence(profilegr.sentence);
            setImage(imagegr);
        }
    },[characterId]);


    return (
        <div className="Home">
            <Header></Header>

            <div className="container">
                <div className="image-container">
                    <Image src={image} alt="error" layout="fill" objectFit="cover"></Image>
                    <div className="gradation"></div>
                    <div className="text-white">
                        <p className="text">朝から会えたんめっちゃ嬉しい～ ぎゅーしてもええ？</p>
                    </div>
                </div>
                <div className="inputcontainer">
                    <div className="inputarea">
                        <div className="name">{name}</div>
                        <div className="introduction"><p>{sentence}</p></div>

                        <div className="submit">
                            <textarea></textarea>
                            <button>submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
