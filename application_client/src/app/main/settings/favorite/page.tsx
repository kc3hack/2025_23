'use client'

import React from 'react';
import Link from 'next/link';
import Header from '@/app/comp/header/header';
import Image from 'next/image';
import '@splidejs/splide/css';
import { Splide, SplideSlide } from 'splide-nextjs/react-splide';


import Profgo from "@/app/comp/prof/gold/prof";
import Profgr from "@/app/comp/prof/green/prof";
import Profbl from "@/app/comp/prof/black/prof";
import Profpi from "@/app/comp/prof/pink/prof";

export default function Favorite() {
    return (
        <div className="Choose">
            <Header></Header>
            <div className="container">
                    <Splide
                        options={{
                            autoplay: false,
                            type   : 'loop',
                            height:'88vh',
                            rewind: true,
                        }}
                    >
                        <SplideSlide>
                            <Profgo></Profgo>
                        </SplideSlide>
                        <SplideSlide>
                            <Profgr></Profgr>
                        </SplideSlide>
                        <SplideSlide>
                            <Profbl></Profbl>
                        </SplideSlide>
                        <SplideSlide>
                            <Profpi></Profpi>
                        </SplideSlide>

                    </Splide>
            </div>
        </div>
    );
}
