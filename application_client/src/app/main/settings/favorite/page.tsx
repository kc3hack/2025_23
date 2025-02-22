'use client'

import React from 'react';
import Header from '@/app/comp/header/header';
import '@splidejs/splide/css';
import dynamic from "next/dynamic";


import Profgo from "@/app/comp/prof/gold/prof";
import Profgr from "@/app/comp/prof/green/prof";
import Profbl from "@/app/comp/prof/black/prof";
import Profpi from "@/app/comp/prof/pink/prof";

import { Options } from "@splidejs/splide";

// SplideとSplideSlideをSSR無効化
const Splide = dynamic(() => import("splide-nextjs/react-splide").then((mod) => mod.Splide) as Promise<React.FC<{ options: Options; children?: React.ReactNode }>>, { ssr: false });
const SplideSlide = dynamic(() => import("splide-nextjs/react-splide").then((mod) => mod.SplideSlide) as Promise<React.FC<{ children?: React.ReactNode }>>, { ssr: false });



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
