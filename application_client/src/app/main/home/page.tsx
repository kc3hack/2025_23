'use client'

import React, {useEffect} from "react";
import {useState} from "react";
import Header from "@/app/comp/header/header";
import './style.scss';
import Image from "next/image";

import {useAtom} from 'jotai';
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

import path from "@/api/dbserver_endpoint_path";

import makesession_uuid from "@/function/makesession_uuid";

//llm front接続におけるtest-path/deploy-path
import llm_front_apiendpoint_path from "@/api/llm_front_apiendpoint_path";
import local_test_path from "@/api/test/local_test_path";

export default function Home() {

    const [name, setName] = useState("");
    const [sentence, setSentence] = useState("");
    const [image, setImage] = useState(imagego);

    const [characterId, setCharacterId] = useAtom(Character_idAtom);
    const [nickname, setNickname] = useState("");
    const [user_id, setUserId] = useState("");

    //sess_uuidの定義
    const [session_uuid, setSessionUUID] = useState("test");
    const handleMakeSession_uuid =() => {
        //sess_uuidの定義
        const inputId:string=makesession_uuid();
        console.log(inputId);
        setSessionUUID(inputId);
    }


    const [text, setText] = useState("");

    //testarea変更の関数
    const handleChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        console.log(text);
    }

    //api関連の関数
    //dbserverからのデータの受け取り
    const recieveData = async () => {
        const response = await axios.get(path + '/character_id_get', {withCredentials: true});
        const response_character_id = response.data.data.character_id;
        const response_user_id=response.data.data.user_id;
        const response_nickname = response.data.data.user_name;//ここではUser_name(別で指定)をdbでuniqueとしてuser_idと紐づけているためnicknameを渡している。同一ユーザ名によるポスグレでの衝突を防ぐため。

        setCharacterId(response_character_id);
        setUserId(response_user_id);
        setNickname(response_nickname);

        console.log("makeit", response.data.data);
    }

    useEffect(() => {
        recieveData();
        handleMakeSession_uuid();
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
    }, [characterId]);

    //llm-frontへのデータをおくる関数、下のbuttonのOnclickでsubmit
    const handleSubmit_for_llmfront = async () => {
        try {
            const submitData = {
                user_input: text,
                character_id: characterId,
                user_id: user_id,
                user_name: nickname,//ここではUser_name(別で指定)をdbでuniqueとしてuser_idと紐づけているためnicknameを渡している。同一ユーザ名によるポスグレでの衝突を防ぐため。
                session_uuid:session_uuid,
            };

            const response = await axios.post(local_test_path, submitData, {withCredentials: true});
            if (response.status === 200) {
                console.log(response);
                console.log("submit_for_llmfront:success");
            } else {
                console.log(response);
                console.log("submit_for_llmfront:error1");
            }
        } catch {
            console.log("submit_for_llmfront:error2");
        }
    };


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
                            <textarea
                                value={text}
                                onChange={handleChangeText}
                                placeholder="message"></textarea>
                            <button onClick={handleSubmit_for_llmfront}>submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
