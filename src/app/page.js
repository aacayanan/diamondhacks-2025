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
    let userId = '51e96e2e-8716-4dbe-b072-cee9b0a1c26c';

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

            const sessionIds = data.map(row => row.origin_session_id);
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
        <div id='page'>
            <div id='sessions-and-start'>
            {/*<SessionList sessions={sessions}/>*/}
            </div>
            <button onClick={handleClick}>Start Session</button>
            <br/>
            <Link href="Report">Report</Link>
        </div>
    );
}