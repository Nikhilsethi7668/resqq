import React from 'react';
import useSocketStore from '../../stores/useSocketStore';
import { AlertTriangle, Radio } from 'lucide-react';

const BlinkAlert = () => {
    const { isBlinking, blinkMessage, blinkType, stopBlinking } = useSocketStore();

    if (!isBlinking) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-pulse-fast bg-red-600 bg-opacity-90">
            <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-2xl animate-bounce-slight">
                {blinkType === 'alert' ? (
                    <AlertTriangle size={80} className="mx-auto text-red-600 mb-6" />
                ) : (
                    <Radio size={80} className="mx-auto text-blue-600 mb-6" />
                )}

                <h1 className="text-4xl font-black text-slate-900 mb-4">
                    {blinkType === 'alert' ? 'CRITICAL ALERT!' : 'BROADCAST MESSAGE'}
                </h1>

                <p className="text-2xl text-slate-700 mb-8 font-bold">
                    {blinkMessage}
                </p>

                <button
                    onClick={stopBlinking}
                    className="bg-slate-900 text-white px-12 py-4 rounded-full text-2xl font-bold hover:bg-slate-800 transition-transform hover:scale-105 shadow-xl"
                >
                    ACKNOWLEDGE & VIEW
                </button>
            </div>
        </div>
    );
};

export default BlinkAlert;
