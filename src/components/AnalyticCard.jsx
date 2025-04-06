'use client';

import React, { useState, useEffect } from 'react';

function AnalyticCard({ title, value, color }) {
    // const [color, setColor] = useState(0);

    // Update color based on the accuracy value
    // Green for 90 and above, yellow for 80-89, red for below 80
    // useEffect(() => {
    //     if (value < 80) {
    //         setColor(2); // red
    //     } else if (value < 90) {
    //         setColor(1); // yellow
    //     } else {
    //         setColor(0); // green (default)
    //     }
    // }, [value]);

    return (
        <div className="w-96 h-96 relative bg-zinc-100 rounded-lg overflow-hidden">
            {/* Background circle */}
            <div className="w-56 h-56 left-[68px] top-[44px] absolute bg-violet-50 rounded-full" />

            {/* Conditional outline based on the color state */}
            {color === 0 && (
                <div className="w-56 h-56 left-[68px] top-[44px] absolute bg-violet-50 rounded-full outline outline-4 outline-green-300" />
            )}
            {color === 1 && (
                <div className="w-56 h-56 left-[68px] top-[44px] absolute bg-violet-50 rounded-full outline outline-4 outline-yellow-300" />
            )}
            {color === 2 && (
                <div className="w-56 h-56 left-[68px] top-[44px] absolute bg-violet-50 rounded-full outline outline-4 outline-red-300" />
            )}

            {/* Title */}
            <div className="w-64 h-7 left-[52px] top-[292px] absolute text-center text-black text-2xl leading-normal">
                {title}
            </div>

            {/* Accuracy Value */}
            <div className="w-52 h-24 left-[77px] top-[110px] absolute text-center text-black text-8xl leading-[96px]">
                {value}
            </div>
        </div>
    );
}

export default AnalyticCard;
