import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../stores/useAuthStore';
import { Camera, Mic, Type, Upload } from 'lucide-react';

const CreateSOS = () => {
    const [mode, setMode] = useState('text'); // text, photo, audio
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [loading, setLoading] = useState(false);

    const mediaRecorderRef = useRef(null);
    const navigate = useNavigate();
    const { user, token } = useAuthStore();

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
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('type', mode === 'photo' ? 'image' : mode);
        formData.append('city', user.city);
        formData.append('state', user.state);

        if (mode === 'text') {
            formData.append('textContent', text);
        } else if (file) {
            formData.append('media', file);
        }

        try {
            await api.post('/api/posts', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('SOS Sent! Help is on the way.');
            navigate('/my-posts');
        } catch (err) {
            console.error(err);
            alert('Failed to send SOS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">EMERGENCY SOS</h1>

            <div className="flex justify-center space-x-4 mb-8">
                <button
                    onClick={() => setMode('text')}
                    className={`p-4 rounded-full ${mode === 'text' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                >
                    <Type size={24} />
                </button>
                <button
                    onClick={() => setMode('photo')}
                    className={`p-4 rounded-full ${mode === 'photo' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                >
                    <Camera size={24} />
                </button>
                <button
                    onClick={() => setMode('audio')}
                    className={`p-4 rounded-full ${mode === 'audio' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                >
                    <Mic size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'text' && (
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Describe the emergency..."
                        className="w-full h-40 p-4 border rounded-lg text-lg"
                        required
                    />
                )}

                {mode === 'photo' && (
                    <div className="text-center">
                        <label className="block w-full p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center">
                                <Upload size={48} className="text-gray-400 mb-2" />
                                <span className="text-gray-600">
                                    {file ? file.name : "Tap to Capture or Upload Photo"}
                                </span>
                            </div>
                        </label>
                    </div>
                )}

                {mode === 'audio' && (
                    <div className="text-center py-10">
                        {!isRecording ? (
                            <button
                                type="button"
                                onClick={startRecording}
                                className="bg-red-600 text-white p-8 rounded-full animate-pulse hover:bg-red-700"
                            >
                                <Mic size={48} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="bg-gray-800 text-white p-8 rounded-full hover:bg-gray-900"
                            >
                                <div className="w-12 h-12 bg-red-500 rounded-sm" />
                            </button>
                        )}
                        <p className="mt-4 text-lg font-semibold">
                            {isRecording ? "Recording... Tap to Stop" : "Tap to Record Audio"}
                        </p>
                        {audioBlob && <p className="text-green-600 mt-2">Audio Recorded!</p>}
                    </div>
                )}

                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                        <strong>Location:</strong> {user?.city}, {user?.state} (Auto-detected from profile)
                    </p>
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
