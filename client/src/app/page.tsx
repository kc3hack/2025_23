import React from "react";
import Link from "next/link";


export default function Home(){
    return(
        <div className="Home">
            <Link href="/test">Test</Link>
        </div>
    );
}