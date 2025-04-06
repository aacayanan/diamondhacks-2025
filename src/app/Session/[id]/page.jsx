'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

function SessionPage() {
    const params = useParams();
    const sessionId = params.id;

    const recorderRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [countdown, setCountdown] = useState(5);
    const [length, setLength] = useState(0);

    let videoWidth = 720;
    let videoHeight = 540;

    // Start the webcam feed the page routes
    useEffect(() => {
        const startVideo = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement("webcam-feed");
            if (video) {
                video.srcObject = stream;
            }
            console.log(stream.getVideoTracks()[0].getSettings().frameRate)
        };
        startVideo();
    }, []);

    // Inject MediaPipe script and draw pose landmarks without initialization of unsupported modules
    useEffect(() => {
        const loadScript = (src) =>
            new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

        //init injections
        const initPose = async () => {
            await Promise.all([
                loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose'),
                loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils'),
                loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils'),
            ]);

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const pose = new window.Pose({
                locateFile: (file) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            pose.onResults((results) => {
                ctx.save();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

                ctx.strokeStyle = "red";
                ctx.lineWidth = 10;
                ctx.moveTo(0,420);
                ctx.lineTo(720,420);
                ctx.stroke();

                if (results.poseLandmarks) {
                    window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
                        color: '#00FF00',
                        lineWidth: 2,
                    });
                    window.drawLandmarks(ctx, results.poseLandmarks, {
                        color: '#FF0000',
                        lineWidth: 1,
                    });
                }

                ctx.restore();
            });

            const camera = new window.Camera(video, {
                onFrame: async () => {
                    await pose.send({ image: video });
                },
                width: videoWidth,
                height: video,
            });

            camera.start();
        };

        initPose();
    }, []);

    // Stop recording and update record state
    const stopRecording = () => {
        recorderRef.current?.stop();
        setRecording(false);
    };

    // Start recorder for the stream that has no drawn anchors
    const startRecording = async () => {
        function countdownTimer() {
            setCountdown(countdown - 1);
            if (countdown > 0) {
                setTimeout(countdownTimer, 1000)
            }
        }

        //delay before starting recording
        await new Promise(resolve => setTimeout(resolve, 5000));
        const stream = videoRef.current?.srcObject;
        if (!stream) return;

        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        const chunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            setRecordedChunks(chunks);
        };

        recorder.start();
        setRecording(true);

        (function recordingLength(i) {
            setTimeout(function() {
                //counter for interface
                if (--i) recordingLength(i);
                setLength(10 - i);
            }, 1000)
        })(10);
        //set length of video
        await new Promise(resolve => setTimeout(resolve, 11000));
        stopRecording();
    };

    // Check record state enable download
    const downloadVideo = () => {
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

    // send to backend for testing
    const sendVideoToBackend = () => {
        if (recordedChunks.length) {
            // create blob from recorded chunks
            const blob = new Blob(recordedChunks, {type: 'video/webm'});
            // create form data
            const formData = new FormData();
            formData.append('blob', blob, 'recorded-video.webm');
            // send blob to backend
            fetch('http://127.0.0.1:5000/process', {
                method: 'POST',
                body: formData,
            })
                .then(response => response.text())
                .then(data => {
                    console.log('Response from backend:', data);
                })
                .catch(error => {
                    console.error('Error sending video to backend:', error)
                });
        }
    };

    return (
        <div id="page" className="flex flex-col items-center gap-4 p-6">
            <div id="title-video" className="flex flex-col rounded-lg gap-2.5 py-8 px-52 bg-white">
                <div id="title" className="text-5xl text-center align-content">
                    <h1>New Session</h1>
                </div>
                <div id="video-container" className="flex justify-center align-content rounded-lg bg-zinc-100">
                    <div id="video-style" className="rounded-lg border-black p-4">
                        <video
                            id="webcam-feed"
                            ref={videoRef}
                            width={videoWidth}
                            height={videoHeight}
                            autoPlay
                            playsInline
                            muted
                            className="hidden"
                        />
                        <canvas
                            id="pose-canvas"
                            ref={canvasRef}
                            width={videoWidth}
                            height={videoHeight}
                            className="rounded-lg rotate-y-180 border border-gray-400"
                        />
                        {countdown > 0 && (
                            <div className="w-28 p-2.5 inline-flex flex-col justify-center items-center gap-2.5">
                                {countdown}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div id="recordbutton-timer" className="flex flex-row">
                <div id="recording-button">
                    {!recording ? (
                        <div>
                            <button onClick={startRecording} className="bg-green-500 h-16 w-64 text-xl text-black px-4 py-2 rounded">
                                Start Recording
                            </button>
                        </div>
                    ) : (
                        <div>
                            <button className="bg-red-500 h-16 w-64 text-xl text-white px-4 py-2 rounded">
                                Recording...
                            </button>
                        </div>
                    )}
                </div>
                <div id="video-time" className="flex justify-items items-center text-xl p-4">
                    <p>{length}/10 seconds</p>
                </div>
            </div>
            <div id="instructions" className="flex flex-col rounded-lg gap-2.5 py-8 px-52 bg-white">
                <div id="instructions-container" className="flex justify-center items-center">
                    <div id="instructions-style" className="text-center justify-start text-black/60 text-base">
                        <p>When you press “Start Recording” a 5 second countdown will begin to give you time to prepare. The recording will go for 30 seconds and cannot be stopped.</p>
                    </div>
                </div>
            </div>
            {recordedChunks.length > 0 && (
                <button onClick={downloadVideo} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Download Video
                </button>
            )}
        </div>
    );
}

export default SessionPage;