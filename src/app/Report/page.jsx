import AnalyticCard from "@/components/AnalyticCard.jsx";

function ReportPage({ id }) {
    // store values with cpr factors from given id
    // const straightArms
    // const compressionDepth
    // const BPMAccuracy

    return(
        <div id='page' className='flex flex-col items-center justify-center h-screen gap-16'>
            <div id='analytics'
                 className='px-7 py-4 bg-white rounded-lg inline-flex flex-col justify-start items-start gap-2.5 overflow-hidden'>
                <div id='analytics-title' className='text-5xl py-6'>
                    <h1>Session04-05-2025</h1>
                </div>
                <div id='analytics-body' className='flex flex-row py-4 items-center gap-4'>
                    <AnalyticCard sessionId={id}/>
                    <AnalyticCard sessionId={id}/>
                    <AnalyticCard sessionId={id}/>
                </div>
            </div>
            <div
                id="gemini-responses"
                className="px-9 py-4 bg-white rounded-lg inline-flex flex-col justify-start items-start gap-2.5 w-fit max-w-[60%]"
            >
                <div
                    id="response-title"
                    className="p-2.5 inline-flex justify-center items-center gap-2.5"
                >
                    <h1 className="text-black text-3xl leading-loose">Generated Feedback</h1>
                </div>

                <div
                    id="response-body"
                    className="px-6 py-4 bg-zinc-100 rounded-lg inline-flex flex-col text-xl items-start gap-2.5 w-fit max-w-[90vw]"
                >
                    <div id="text">
                        <p>
                            Your overall CPR quality is a 59.7%. You just might save them... maybe...
                            Your arms are very straight which is a plus, but your compressions are not where they need
                            to be.
                            Also, you should remember the accurate speed for CPR is anywhere between 100-120 BPM.
                            Get those down, and you might just save someone!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportPage;