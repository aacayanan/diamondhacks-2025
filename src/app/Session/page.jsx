'use client';

import { useEffect, useRef, useState } from 'react';

function SessionPage() {
    const recorderRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [countdown, setCountdown] = useState(0);
    const [length, setLength] = useState(0);

    // Start the webcam feed the page routes
    useEffect(() => {
        const startVideo = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement("webcam-feed");
            if (video) {
                video.srcObject = stream;
            }
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

                if (results.poseLandmarks) {
                    window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
                        color: '#00FF00',
                        lineWidth: 2,
                    });
                    window.drawLandmarks(ctx, results.poseLandmarks, {
                        color: '#FF0000',
                        lineWidth: 2,
                    });
                }

                ctx.restore();
            });

            const camera = new window.Camera(video, {
                onFrame: async () => {
                    await pose.send({ image: video });
                },
                width: 960,
                height: 720,
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
        (function recordingCountdown(i) {
            setTimeout(function() {
                //counter for interface
                if (--i) recordingCountdown(i);
                setCountdown(i + 1);
            }, 1000)
        })(5);

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

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <video
                id="webcam-feed"
                ref={videoRef}
                width={960}
                height={720}
                autoPlay
                playsInline
                muted
                className="hidden"
            />
            <canvas
                id="pose-canvas"
                ref={canvasRef}
                width={960}
                height={720}
                className="rotate-y-180 border border-gray-400"
            />
            {!recording ? (
                <div>
                    <button onClick={startRecording} className="bg-green-500 text-white px-4 py-2 rounded">
                        Start Recording
                    </button>
                    <p>{countdown}</p>
                </div>
            ) : (
                <div>
                    <button className="bg-red-500 text-white px-4 py-2 rounded">
                    Recording...
                    </button>
                    <p>{length}</p>
                </div>
            )}
            {recordedChunks.length > 0 && (
                <button onClick={downloadVideo} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Download Video
                </button>
            )}
        </div>
    );
}

export default SessionPage;