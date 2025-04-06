//Root directory is currently working as the home page
'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {supabase} from "@/lib/supabaseClient";
import {useRouter} from 'next/navigation';
import SessionList from "../components/SessionList.jsx";

export default function HomePage() {
    const router = useRouter();
    const [sessions, setSessions] = useState([]);
    let userId = `51e96e2e-8716-4dbe-b072-cee9b0a1c26c`;

    useEffect(() => {
        const fetchSessions = async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('id')
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching sessions:', error);
                return;
            }

            const sessionIds = data.map(row => row.id);
            setSessions(sessionIds);
        };

        fetchSessions();
    }, [userId]);

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
        <div id='page' className='h-screen flex items-center justify-center gap-11'>
            <div id='graphs' className='w-[760px] inline-flex flex-col justify-start items-start gap-20'>
                <div id='graph' className='self-stretch px-8 py-5 bg-white rounded-lg inline-flex flex-col justify-start items-start gap-1.5 overflow-hidden'>
                    <div id='graph-title' className='p-2.5 inline-flex justify-center items-center gap-2.5'>
                        <h1 className='justify-start text-black text-3xl font-normal'>CPR Accuracy over Time</h1>
                    </div>
                    <div id='graph-body' className='w-[690px] px-8 py-20 bg-zinc-100 rounded-lg inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden'>
                        {/*<img id="graph-style" className="self-stretch h-80" src="" alt="not enough data..."/>*/}
                    </div>
                </div>
            </div>
            <div id='sessions-and-start' className='w-96 inline-flex flex-col justify-start items-center gap-12'>
                <div id="sessions"
                     className='w-96 h-[651px] px-7 py-8 bg-white rounded-lg inline-flex flex-col justify-start items-start gap-6 overflow-hidden'>
                    <div id="sessions-title"
                         className="self-stretch h-7 justify-start text-black text-3xl font-normal leading-loose">
                        Previous Sessions
                    </div>
                    <div id="sessions-body"
                         className="self-stretch h-[535px] relative bg-zinc-100 rounded-lg overflow-hidden">
                        <SessionList sessions={sessions}/>
                    </div>
                </div>
                <div id="start">
                    <button onClick={handleClick} className="w-[385px] h-[60px] text-2xl cursor-pointer transition-all bg-[#2c2c2c] text-white px-6 py-2 rounded-lg border-[black] border-b-[4px]">Start
                        Session
                    </button>
                </div>
            </div>
        </div>
    );
}