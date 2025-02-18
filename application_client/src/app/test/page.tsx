import React from "react";
import Link from "next/link";
import Login from "@/app/auth/login/page"
import Header from "@/app/comp/header/header"
import Prof from "@/app/comp/prof/green/prof";

export default function Test() {

    return (
        <div className="Test">
            <Header></Header>
            <Link href="/auth/login">login</Link><br/>
            <Link href="/auth/signup">signup</Link><br/>
            <Link href="/main/home">home</Link><br/>
            <Link href="/main/settings/choose">choose</Link><br/>
            <Link href="/main/settings/favorite">favorite</Link><br/>
            <Link href="/main/start">start</Link><br/>
            <Prof></Prof>
        </div>
    )
}