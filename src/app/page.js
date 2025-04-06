'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/navigation';
import SessionList from "../components/SessionList.jsx";
import AnalyticCard from "@/components/AnalyticCard";

export default function HomePage() {
    const router = useRouter();
    const [averagedSessionData, setAveragedSessionData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const userId = '51e96e2e-8716-4dbe-b072-cee9b0a1c26c';

    // Fetch all sessions for the user and calculate averages
    useEffect(() => {
        const fetchSessionData = async () => {
            const { data, error } = await supabase
                .from("sessions")
                .select("*")
                .eq("user_id", userId);

            if (error) {
                console.error("Error fetching session data:", error);
            } else if (data && data.length > 0) {
                const totals = data.reduce((acc, cur) => {
                    return {
                        l_elbow_angle: (acc.l_elbow_angle || 0) + (cur.l_elbow_angle || 0),
                        r_elbow_angle: (acc.r_elbow_angle || 0) + (cur.r_elbow_angle || 0),
                        bpm: (acc.bpm || 0) + (cur.bpm || 0),
                    };
                }, {});

                const averages = {
                    l_elbow_angle: totals.l_elbow_angle / data.length,
                    r_elbow_angle: totals.r_elbow_angle / data.length,
                    bpm: totals.bpm / data.length,
                };

                setAveragedSessionData(averages);
            }
        };

        if (userId) {
            fetchSessionData();
        }
    }, [userId]);

    // Fetch session IDs for the session list
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
        // Insert a new session for the user
        const { data, error } = await supabase
            .from('sessions')
            .insert({ user_id: userId })
            .select();

        if (error) {
            console.error('Supabase insert error: ', error);
            return;
        }

        const session_id = data[0].id;
        router.push(`/Session/${session_id}`);
    };

    return (
        <div id='page' className='h-screen flex items-center justify-center gap-11 bg-gray-50 p-4'>
            {/* Analytics Section */}
            <div id='analytics-container' className='flex flex-col items-start gap-10'>
                <div
                    id='analytics-card'
                    className='w-full px-8 py-5 bg-white rounded-lg shadow-lg flex flex-col gap-4'
                >
                    <div id='analytics-title' className='w-full flex justify-between items-center'>
                        <h1 className='text-black text-3xl font-semibold'>Analytics Summary</h1>
                        <Link href="/detailed-analytics" className="text-blue-500 hover:underline">
                            View Details
                        </Link>
                    </div>
                    <div
                        id='analytics-body'
                        className='w-full grid grid-cols-1 md:grid-cols-3 gap-6 py-4'
                    >
                        <AnalyticCard
                            title="Left Arm"
                            value={`${Math.floor((averagedSessionData?.l_elbow_angle / 180) * 100)}%`}
                            color={
                                Math.floor((averagedSessionData?.l_elbow_angle / 180) * 100) > 95
                                    ? 0
                                    : (Math.floor((averagedSessionData?.l_elbow_angle / 180) * 100) > 80 ? 1 : 2)
                            }
                        />
                        <AnalyticCard
                            title="Right Arm"
                            value={`${Math.floor((averagedSessionData?.r_elbow_angle / 180) * 100)}%`}
                            color={
                                Math.floor((averagedSessionData?.r_elbow_angle / 180) * 100) > 95
                                    ? 0
                                    : (Math.floor((averagedSessionData?.r_elbow_angle / 180) * 100) > 80 ? 1 : 2)
                            }
                        />
                        <AnalyticCard
                            title="BPM"
                            value={Math.floor(averagedSessionData?.bpm)}
                            color={
                                ((Math.floor(averagedSessionData?.bpm) >= 95 && Math.floor(averagedSessionData?.bpm) <= 99) ||
                                    (Math.floor(averagedSessionData?.bpm) >= 121 && Math.floor(averagedSessionData?.bpm) <= 125))
                                    ? 1
                                    : (Math.floor(averagedSessionData?.bpm) > 125 || Math.floor(averagedSessionData?.bpm) < 94 ? 2 : 0)
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Sessions & Start Button */}
            <div id='sessions-and-start' className='w-96 flex flex-col items-center gap-1'>
                <div
                    id="sessions"
                    className='w-96 px-7 py-8 bg-white rounded-lg shadow-lg flex flex-col gap-6 overflow-hidden'
                >
                    <div
                        id="sessions-title"
                        className="w-full text-black text-3xl font-normal leading-loose"
                    >
                        Previous Sessions
                    </div>
                    <div
                        id="sessions-body"
                        className="w-full relative bg-zinc-100 rounded-lg overflow-auto"
                    >
                        <SessionList sessions={sessions} />
                    </div>
                </div>
                <div id="start">
                    <button
                        onClick={handleClick}
                        className="w-[385px] h-[60px] text-2xl cursor-pointer transition-all bg-[#2c2c2c] text-white px-6 py-2 rounded-lg border-black border-b-4"
                    >
                        Start Session
                    </button>
                </div>
            </div>
        </div>
    );
}
