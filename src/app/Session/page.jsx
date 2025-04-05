'use client';

import {createElement, useRef, useState} from 'react';

function SessionPage() {
    const recorderRef = useRef(null); //record started with actual video feed
    const [recording, setRecording] = useState(false); //start and stop recording
    const [recordedChunks, setRecordedChunks] = useState([]); //save video chunks in array before blob conversion

    const startVideo = async () => {
        //start video stream and store in component id "webcam-feed"
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const feed = document.getElementById("webcam-feed")
        feed.srcObject = stream;
    }

    startVideo();

    const startRecording = async () => {
        //initialize recorded object and array for video chunks
        const video = new MediaRecorder(stream);
        recorderRef.current = video;
        const chunks = [];

        //checks if chunk data is being received from recorder
        video.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        //updates array state with full array when stop state is enabled
        video.onstop = () => {
            setRecordedChunks(chunks);
        };

        //updates record state
        video.start();
        setRecording(true);
    };

    const stopRecording = () => {
        //stops recording and updates record state to active downloads
        recorderRef.current.stop();
        setRecording(false);
    };

    const downloadVideo = () => {
        //checks if chunk array has any video data
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recorded-video.webm';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };

    return (
        <div>
            <video id="webcam-feed" autoPlay playsInline></video>
            {!recording ? (
                <button onClick={startRecording}>
                    Start Recording
                </button>
            ) : (
                <button onClick={stopRecording}>
                    Stop Recording
                </button>
            )}
            {recordedChunks.length > 0 && (
                <button onClick={downloadVideo}>
                    Download Video
                </button>
            )}
        </div>
    );
}

export default SessionPage;
