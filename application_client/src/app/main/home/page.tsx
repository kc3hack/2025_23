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
import imagepi from "@/public/person/pink/穂谷 希愛 朝.jpg";
import imagebl from "@/public/person/black/夜久野 怜狐 昼.png";
import imagegr from "@/public/person/green/伏見 瞳華 昼.jpg"
import axios from "axios";

import path from "@/api/dbserver_endpoint_path";

import makesession_uuid from "@/function/makesession_uuid";

//llm front接続におけるtest-path/deploy-path
//import llm_front_apiendpoint_path from "@/api/llm_front_apiendpoint_path";
import local_test_path from "@/api/test/local_test_path";

export default function Home() {


    const [name, setName] = useState("");
    const [sentence, setSentence] = useState("");
    const [image, setImage] = useState(imagego);

    const [characterId, setCharacterId] = useAtom(Character_idAtom);
    const [nickname, setNickname] = useState("");
    const [user_id, setUserId] = useState("");


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

        console.log(newItems);
        setHistory(prevHistory => [...prevHistory, ...newItems]);
    };*/

    const handleHistoryAdd = async (newMessage: { content: string; type: string }) => {
        const responseHistory = await JSON.parse(localStorage.getItem("history") || "[]");

        const updatedHistory = [...responseHistory, newMessage];
        setHistory(updatedHistory);
        console.log("ok");

        localStorage.setItem("history", JSON.stringify(updatedHistory));
    };

    //sess_uuidの定義
    const [session_uuid, setSessionUUID] = useState("test");
    const handleMakeSession_uuid = () => {
        //sess_uuidの定義
        const inputId: string = makesession_uuid();
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
        const response_user_id = response.data.data.user_id;
        const response_nickname = response.data.data.user_name;//ここではUser_name(別で指定)をdbでuniqueとしてuser_idと紐づけているためnicknameを渡している。同一ユーザ名によるポスグレでの衝突を防ぐため。

        setCharacterId(response_character_id);
        setUserId(response_user_id);
        setNickname(response_nickname);
    }

    const limitRef = useRef(false);

    //llm-frontへのデータをおくる関数、下のbuttonのOnclickでsubmit
    const handleSubmit_for_llmfront = async () => {

        if (limitRef.current) return; // すでに実行中なら何もしない
        limitRef.current = true; // 実行フラグを立てる
        handleHistoryAdd({content:text,type:"human"});

        try {
            const submitData = {
                user_input: text,
                character_id: characterId,
                user_id: user_id,
                user_name: nickname,//ここではUser_name(別で指定)をdbでuniqueとしてuser_idと紐づけているためnicknameを渡している。同一ユーザ名によるポスグレでの衝突を防ぐため。
                session_uuid: session_uuid,
            };

            const response = await axios.post(local_test_path, submitData,
                {withCredentials: true});

            if (response.status === 200) {
                console.log(response);

                //返ってきた値の設定
                console.log("submit_for_llmfront:success");

                const { text, audioData } = response.data;

                //dataを受け取った後の処理
                //text
                handleHistoryAdd({content:text,type:"ai"});
                console.log(localStorage.getItem("history"));
                console.log(history);

                const audioBuffer = new Uint8Array(Buffer.from(audioData, 'base64'));
                const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);


                // 音声再生
                await audio.play();
                console.log("Audio playing...");

            } else {
                console.log(response);
                console.log("submit_for_llmfront:error1");
            }
        } catch {
            console.log("submit_for_llmfront:error2");
        }finally {
            limitRef.current = false; // 実行完了後にリセット
        }
    };

    //posgreからのデータの受け取り

    const handleHistoryGet = async () => {
        try {
            const responseData = await axios.get(path + "/postgres", { withCredentials: true });
            console.log(responseData);

            const responseHistory = responseData.data; // 配列が返っているか確認
            console.log(responseHistory);

            localStorage.clear();
            localStorage.setItem("history", JSON.stringify(responseHistory));
            console.log("a",localStorage.getItem("history"));
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
        //addTenHistoryItems(); test
        recieveData();
        handleMakeSession_uuid();
        handleHistoryGet();
        delayedFunction();

        console.log("b",localStorage.getItem("history"));
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
                            <button onClick={handleSubmit_for_llmfront}>submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
