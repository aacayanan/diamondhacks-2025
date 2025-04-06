//Root directory is currently working as the home page
'use client';

import {useState} from 'react';
import Link from 'next/link';
import {supabase} from "@/lib/supabaseClient";
import {useRouter} from 'next/navigation';

export default function Home() {
    const router = useRouter();

    const handleClick = async () => {
        // insert a new row in Supabase
        const {data, error} = await supabase
            .from('sessions')
            .insert({ 'user_id': '51e96e2e-8716-4dbe-b072-cee9b0a1c26c' })
            .select();
        const session_id = data[0].id;
        if (error) {
            console.error('Supabase insert error: ', error);
        }
        router.push(`/Session/${session_id}`);
    }


    return (
        <div>
            <h1>Login Page</h1>
            <button onClick={handleClick}>Start Session</button>
        </div>
    );
}