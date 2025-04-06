"use client";

import AnalyticCard from "@/components/AnalyticCard.jsx";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {supabase} from "@/lib/supabaseClient.js";

function ReportPage() {
    const params = useParams();
    const sessionId = params.id;

    const [sessionData, setSessionData] = useState(null);

    useEffect(() => {
        const fetchSessionData = async () => {
            const {data, error} = await supabase
                .from("sessions") // your table name
                .select("*")
                .eq("id", sessionId)
                .single();

            if (error) {
                console.error("Error fetching session data:", error);
            } else {
                setSessionData(data);
            }
        };
        if (sessionId) {
            fetchSessionData();
        }
    }, [sessionId]);


    return (
        <div id='page' className='flex flex-col items-center justify-center h-screen gap-16'>
            <div id='analytics'
                 className='px-7 py-4 bg-white rounded-lg inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden'>
                <div id='analytics-title' className='text-5xl py-6'>
                    <h1>Session: {sessionId}</h1>
                </div>
                <div id='analytics-body' className='flex flex-row py-4 items-center gap-4'>
                    <AnalyticCard title="Left Arm" value={`${Math.floor((sessionData?.l_elbow_angle / 180) * 100)}%`} />
                    <AnalyticCard title="Right Arm" value={`${Math.floor((sessionData?.r_elbow_angle / 180) * 100)}%`} />
                    <AnalyticCard title="BPM" value={Math.floor((sessionData?.bpm))} />
                </div>
            </div>
            <div id="gemini-responses"
                 className="px-9 py-4 bg-white rounded-lg inline-flex flex-col justify-start items-start gap-2.5 w-fit max-w-[60%]">
                <div id="response-title" className="p-2.5 inline-flex justify-center items-center gap-2.5">
                    <h1 className="text-black text-3xl leading-loose">Generated Feedback</h1>
                </div>
                <div id="response-body"
                     className="px-6 py-4 bg-zinc-100 rounded-lg inline-flex flex-col text-xl items-start gap-2.5 w-fit max-w-[90vw]">
                    <div id="text">
                        <p>
                            Your overall CPR quality is a 59.7%. You just might save them... maybe...
                            Your arms are very straight which is a plus, but your compressions are not where they
                            need
                            to be. Also, you should remember the accurate speed for CPR is anywhere between 100-120
                            BPM.
                            Get those down, and you might just save someone!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportPage;
