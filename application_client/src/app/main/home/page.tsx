'use client'

import React, {useEffect} from "react";
import {useState} from "react";
import {useRef} from "react";
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
import imagegonight from "@/public/person/gold/嵐山 小春 夜.jpg";
import imagepi from "@/public/person/pink/穂谷 希愛 朝.jpg";
import imagepinight from "@/public/person/pink/穂谷 希愛 夕方.jpg"
import imagebl from "@/public/person/black/夜久野 怜狐 昼.png";
import imageblnight from "@/public/person/black/夜久野 怜狐 夕.jpg"
import imagegr from "@/public/person/green/伏見 瞳華 昼.jpg"
import imagegrnight from "@/public/person/green/伏見 瞳華 夜.jpg"
import axios from "axios";

import path from "@/api/dbserver_endpoint_path";

import makesession_uuid from "@/function/makesession_uuid";

//llm front接続におけるtest-path/deploy-path
import llm_front_apiendpoint_path from "@/api/llm_front_apiendpoint_path";
//import local_test_path from "@/api/test/local_test_path";

export default function Home() {


    const [name, setName] = useState("");
    const [sentence, setSentence] = useState("");
    const [image, setImage] = useState(imagego);

    const [characterId, setCharacterId] = useAtom(Character_idAtom);
    const [nickname, setNickname] = useState("");
    const [user_id, setUserId] = useState("");


    //時間関数
    const [time, setTime] = useState(new Date());
    const isBetween18to3 = () => {
        const hours = time.getHours();
        return hours >= 18 || hours < 3;
    };




    //値の変更に伴う変数の変換
    const [history,setHistory]=useState([{
        content:"",
        type:"",
    }]);

    //test
    /*const addTenHistoryItems = () => {
        const newItems = [
            { content: "今日何してたの？", type: "human" },
            { content: "お仕事してたよ〜！〇〇くんは？", type: "ai" },
            { content: "俺はちょっとゲームしてた！", type: "human" },
            { content: "いいな〜！どんなゲーム？", type: "ai" },
            { content: "RPG系のやつ！ストーリーがめっちゃ面白い！", type: "human" },
            { content: "そうなんだ！今度一緒にやってみたいな♡", type: "ai" },
            { content: "それいいね！今度一緒にやろう！", type: "human" },
            { content: "約束だよ？指切り〜♪", type: "ai" },
            { content: "指切りげんまん！", type: "human" },
            { content: "破ったら…罰ゲームだよ？(笑)", type: "ai" },
        ];

        localStorage.setItem("history", JSON.stringify(newItems));
        setHistory(newItems);

        setHistory(prevHistory => [...prevHistory, ...newItems]);
    };*/

    const handleHistoryAdd = async (newMessage: { content: string; type: string }) => {
        const responseHistory = await JSON.parse(localStorage.getItem("history") || "[]");

        const updatedHistory = [...responseHistory, newMessage];
        setHistory(updatedHistory);

        localStorage.setItem("history", JSON.stringify(updatedHistory));
    };

    //sess_uuidの定義
    const [session_uuid, setSessionUUID] = useState("");
    const handleMakeSession_uuid = () => {
        //sess_uuidの定義
        const inputId:　string = makesession_uuid();
        setSessionUUID(inputId);
    }


    const [text, setText] = useState("");

    //testarea変更の関数
    const handleChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    }

    //api関連の関数
    //dbserverからのデータの受け取り
    const recieveData = async () => {
        const response = await axios.get(path + '/character_id_get', {withCredentials: true});
        const response_character_id = response.data.data.character_id;
        const response_user_id = response.data.data.user_id;
        const response_nickname = response.data.data.user_name;//ここではUser_name(別で指定)をdbでuniqueとしてuser_idと紐づけているためnicknameを渡している。同一ユーザ名によるポスグレでの衝突を防ぐため。

        setCharacterId(response_character_id);
        setUserId(response_user_id);
        setNickname(response_nickname);
    }

    const limitRef = useRef(false);

    //llm-frontへのデータをおくる関数、下のbuttonのOnclickでsubmit
    const handleSubmit_for_llmfront = async () => {

        if (limitRef.current) return; //
        limitRef.current = true;

        handleHistoryAdd({content:text,type:"human"});
        setText("");
        try {
            const submitData = {
                user_input: text,
                character_id: characterId,
                user_id: user_id,
                user_name: nickname,//ここではUser_name(別で指定)をdbでuniqueとしてuser_idと紐づけているためnicknameを渡している。同一ユーザ名によるポスグレでの衝突を防ぐため。
                session_uuid: session_uuid,
            };

            const response = await axios.post(llm_front_apiendpoint_path, submitData,
                {withCredentials: true});

            if (response.status === 200) {

                const { text, audio_data } = response.data;

                //dataを受け取った後の処理
                //text
                handleHistoryAdd({content:text,type:"ai"});

                const audioBuffer = new Uint8Array(Buffer.from(audio_data, 'base64'));
                const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);


                // 音声再生
                await audio.play();

            }
        } catch {
        }finally {
            limitRef.current = false; //
        }
    };

    //posgreからのデータの受け取り

    const handleHistoryGet = async () => {
        try {
            const responseData = await axios.get(path + "/postgres", { withCredentials: true });

            const responseHistory = responseData.data; // 配列が返っているか確認

            localStorage.clear();
            localStorage.setItem("history", JSON.stringify(responseHistory));
            setHistory(responseHistory);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };





    //マウント時、実行ラグ3000ms
    const delayedFunction = () => {
        setTimeout(() => {
            handleSubmit_for_llmfront()
        }, 3000);
    };

    useEffect(() => {
        setTime(new Date());
        //addTenHistoryItems(); test
        recieveData();
        handleMakeSession_uuid();
        handleHistoryGet();
        delayedFunction();

    }, []);


    useEffect(() => {
        if (characterId == 0) {
            setName(profilego.name);
            setSentence(profilego.sentence);
            if (!isBetween18to3()) {
                setImage(imagego)
            } else {
                setImage(imagegonight);
            }
        } else if (characterId == 1) {
            setName(profilepi.name);
            setSentence(profilepi.sentence);
            if(!isBetween18to3()){
                setImage(imagepi)
            } else{
                setImage(imagepinight);
            }

        } else if (characterId == 2) {
            setName(profilebl.name);
            setSentence(profilebl.sentence);
            if(!isBetween18to3()){
                setImage(imagebl)
            }else{
                setImage(imageblnight);
            }
        } else if (characterId == 3) {
            setName(profilegr.name);
            setSentence(profilegr.sentence);
            if(!isBetween18to3()){
                setImage(imagegr)
            } else{
                setImage(imagegrnight);
            }

        }
    }, [characterId]);


    return (

        <div className="Home">
            <Header></Header>

            <div className="container">
                <div className="image-container">
                    <Image src={image} alt="error" layout="fill" objectFit="cover"></Image>
                    <div className="gradation"></div>
                    <div className="text-white">
                        {history.map((item, index) => (
                            item.type === "ai" ? (
                                <div key={index} className="ai message">
                                    {item.content}
                                </div>
                            ) : (
                                <div key={index} className="human message">
                                    {item.content}
                                </div>
                            )
                        ))}

                        <div className="space"></div>
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
                            <button onClick={handleSubmit_for_llmfront}>送信</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
