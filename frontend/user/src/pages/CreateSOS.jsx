import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../stores/useAuthStore';
import { Camera, Mic, Type, Upload, X } from 'lucide-react';

const CreateSOS = () => {
    const { user, token } = useAuthStore();
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'audio'
    const [city, setCity] = useState(user?.city || '');
    const [state, setState] = useState(user?.state || '');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [loading, setLoading] = useState(false);

    // Camera states
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    const mediaRecorderRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setFile(new File([blob], "sos_audio.webm", { type: 'audio/webm' }));
                setMediaType('audio');
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setFile(null); // Clear any existing photo
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please grant permission.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Open camera for live photo capture
    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            setCameraStream(stream);
            setShowCamera(true);

            // Wait for video element to be ready
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please grant permission or check if camera is available.");
        }
    };

    // Capture photo from camera
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                const file = new File([blob], `sos_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                setFile(file);
                setMediaType('image');
                setCapturedImage(URL.createObjectURL(blob));
                closeCamera();
                setAudioBlob(null); // Clear any existing audio
            }, 'image/jpeg', 0.95);
        }
    };

    // Close camera and cleanup
    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
    };

    const handlePhotoSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMediaType('image');
            setCapturedImage(URL.createObjectURL(selectedFile));
            setAudioBlob(null); // Clear any existing audio
        }
    };

    const clearMedia = () => {
        setFile(null);
        setMediaType(null);
        setAudioBlob(null);
        setCapturedImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that at least one input method is provided
        if (!text.trim() && !file) {
            alert('Please provide at least a description, photo, or audio recording.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        // Determine type: default 'text', but if media exists, use that type
        const type = mediaType || 'text';
        formData.append('type', type);
        formData.append('city', city);
        formData.append('state', state);
        formData.append('textContent', text);

        if (file) {
            formData.append('media', file);
        }

        try {
            await api.post('/posts', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('SOS Sent! Help is on the way.');
            navigate('/my-posts');
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to send SOS';
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">EMERGENCY SOS</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Optional Text Input */}
                <div>
                    <label className="block text-gray-700 font-bold mb-2">
                        Text (Optional)
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Describe the situation... (optional if you're sending photo/audio)"
                        className="w-full h-32 p-4 border rounded-lg text-lg focus:ring-2 focus:ring-red-500"
                    />
                </div>

                {/* 2. Optional Media Attachment */}
                <div className="border-t pt-4">
                    <label className="block text-gray-700 font-bold mb-4">Attach Media (Optional)</label>

                    {!file && !isRecording && (
                        <div className="flex space-x-4">
                            {/* Camera Button - Opens Live Camera */}
                            <button
                                type="button"
                                onClick={openCamera}
                                className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Camera size={32} className="text-gray-500 mb-2" />
                                <span className="text-sm text-gray-600 font-medium">Take Photo</span>
                                <span className="text-xs text-gray-400 mt-1">Live Camera</span>
                            </button>

                            {/* File Upload Button - Hidden but available */}
                            <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                                <Upload size={32} className="text-gray-500 mb-2" />
                                <span className="text-sm text-gray-600 font-medium">Upload Photo</span>
                                <span className="text-xs text-gray-400 mt-1">From Gallery</span>
                            </label>

                            {/* Audio Button */}
                            <button
                                type="button"
                                onClick={startRecording}
                                className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Mic size={32} className="text-gray-500 mb-2" />
                                <span className="text-sm text-gray-600 font-medium">Record Audio</span>
                                <span className="text-xs text-gray-400 mt-1">Voice Message</span>
                            </button>
                        </div>
                    )}

                    {/* Recording State */}
                    {isRecording && (
                        <div className="text-center py-6 bg-red-50 rounded-lg animate-pulse">
                            <p className="text-red-600 font-bold mb-2">Recording Audio...</p>
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700"
                            >
                                Stop Recording
                            </button>
                        </div>
                    )}

                    {/* Selected Media Preview */}
                    {file && !isRecording && (
                        <div className="space-y-3">
                            {mediaType === 'image' && capturedImage && (
                                <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                                    <img
                                        src={capturedImage}
                                        alt="Captured"
                                        className="w-full h-auto max-h-96 object-contain bg-gray-100"
                                    />
                                </div>
                            )}
                            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {mediaType === 'image' ? (
                                        <Camera className="text-blue-600" />
                                    ) : (
                                        <Mic className="text-blue-600" />
                                    )}
                                    <span className="font-medium text-gray-700">
                                        {mediaType === 'image' ? (file.name || 'Photo Captured') : 'Voice Message Recorded'}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearMedia}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Camera Modal */}
                {showCamera && (
                    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                        <div className="relative w-full max-w-4xl">
                            {/* Close Button */}
                            <button
                                onClick={closeCamera}
                                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
                            >
                                <X size={24} className="text-gray-800" />
                            </button>

                            {/* Camera Preview */}
                            <div className="bg-black rounded-lg overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-auto"
                                    style={{ maxHeight: '70vh' }}
                                />
                            </div>

                            {/* Capture Button */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={capturePhoto}
                                    className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-red-700 transition-colors shadow-lg"
                                >
                                    📸 Capture Photo
                                </button>
                                <p className="text-white text-sm mt-3">Position the camera and click to capture</p>
                            </div>

                            {/* Hidden Canvas for Capture */}
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    </div>
                )}

                {/* 3. Location Confirmation */}
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200 space-y-3">
                    <p className="text-sm text-yellow-800 font-semibold">
                        📍 Confirm Location:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                                placeholder="Enter City"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                                placeholder="Enter State"
                                required
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-4 rounded-lg text-xl font-bold hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'SENDING HELP REQUEST...' : 'SEND SOS NOW'}
                </button>
            </form>
        </div>
    );
};

export default CreateSOS;
