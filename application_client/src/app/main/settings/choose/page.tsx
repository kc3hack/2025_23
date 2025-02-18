'use client'

import React from 'react'
import {useState} from "react";
import Link from "next/link";
import Header from "@/app/comp/header/header";
import './style.scss';
import Image from "next/image";

import logo from "@/public/sub1.png"


export default function Choose(){
    return (
        <div className="Choose">
            <Header></Header>
            <div className="container">
                <Image src={logo} alt="error" className="logo"></Image>
                <div className="text-container">
                    <textarea placeholder="　your favorite"></textarea>
                    <textarea placeholder="　your favorite"></textarea>
                    <textarea placeholder="　your favorite"></textarea>
                    <textarea placeholder="　your favorite"></textarea>
                    <button>set</button>
                </div>
            </div>
        </div>
    )
}
