"use client"
import React from "react";
import { TypeAnimation } from "react-type-animation";

export default function TypingComponent() {
    return (        
        <React.Fragment>
        <TypeAnimation
        className="text-2xl text-center mx-auto font-medium text-blue-500"
        sequence={
            [
                "Select your course in the sidebar or create a new one. 😊",
                1000, 
                ""
            ]
        }
        repeat={Infinity}
        speed={50}
        />
        </React.Fragment>
    )
}