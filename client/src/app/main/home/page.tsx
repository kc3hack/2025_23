'use client'

import React, {useEffect} from "react";
import {useState} from "react";
import Link from "next/link";
import Header from "@/comp/header/header";
import './style.scss';
import Image from "next/image";
import goldgirl from "@/public/person/gold/image_fx__1.jpg"

import profile from "@/global/person/gold/string"

export default function Home() {
    return (
        <div className="Home">
            <Header></Header>

            <div className="container">
                <div className="image-container">
                    <Image src={goldgirl} alt="error" layout="fill" objectFit="cover"></Image>
                    <div className="gradation"></div>
                    <div className="text-white">
                        <p className="text">朝から会えたんめっちゃ嬉しい～ ぎゅーしてもええ？</p>
                    </div>
                </div>
                <div className="inputcontainer">
                    <div className="inputarea">
                        <div className="name">{profile.name}</div>
                        <div className="introduction"><p>{profile.sentence}</p></div>

                        <div className="submit">
                            <textarea></textarea>
                            <button></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
