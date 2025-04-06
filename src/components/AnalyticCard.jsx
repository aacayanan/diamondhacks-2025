'use client';

import React from 'react';
import {useState} from 'react';

function AnalyticCard({ sessionId, title}) {
    const [color, setColor] = useState(0);

    //get accuracy from backend
    //const accuracy

    //conditional if the accuracy is under 90 setColor(1) for yellow
    //conditional else if the accuracy is under 80 setColor(2) for red

    return (
        <div className="w-96 h-96 relative bg-zinc-100 rounded-lg overflow-hidden">
            <div className="w-56 h-56 left-[68px] top-[44px] absolute bg-violet-50 rounded-full"/>
            {color === 0 && (
                <div className="w-56 h-56 left-[68px] top-[44px] absolute bg-violet-50 rounded-full outline outline-4 outline-green-300"/>
            )}
            {color === 1 && (
                <div className="w-56 h-56 left-[68px] top-[44px] absolute bg-violet-50 rounded-full outline outline-4 outline-yellow-300"/>
            )}
            {color === 2 && (
                <div className="w-56 h-56 left-[68px] top-[44px] absolute bg-violet-50 rounded-full outline outline-4 outline-red-300"/>
            )}
            <div className="w-64 h-7 left-[52px] top-[292px] absolute text-center justify-start text-black text-2xl leading-normal">
                title
            </div>
            <div className="w-52 h-24 left-[77px] top-[110px] absolute text-center justify-start text-black text-8xl leading-[96px]">
                accuracy%
            </div>
        </div>
    );
}

export default AnalyticCard;