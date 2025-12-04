import React from 'react';
import { Shield, Smartphone, Radio, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: <Smartphone size={48} className="text-blue-600" />,
            title: "1. Report Emergency",
            description: "Open the app and click 'Report Emergency'. You can send text, photos, or record audio. Your location is automatically detected."
        },
        {
            icon: <Radio size={48} className="text-red-600" />,
            title: "2. Smart Routing",
            description: "Our system analyzes the danger level and instantly routes your alert to the nearest City, State, or Central Admin."
        },
        {
            icon: <Shield size={48} className="text-green-600" />,
            title: "3. Rapid Response",
            description: "Admins receive a real-time blinking alert. They investigate and dispatch help immediately."
        },
        {
            icon: <CheckCircle size={48} className="text-purple-600" />,
            title: "4. Stay Safe",
            description: "You receive updates when help is on the way. Once resolved, you can rate the response."
        }
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-center mb-4 text-slate-800">How ResQ Connect Works</h1>
            <p className="text-xl text-center text-gray-600 mb-16">Your safety line in 4 simple steps.</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-slate-50 rounded-full">
                                {step.icon}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                    </div>
                ))}
            </div>

            <div className="mt-20 bg-blue-600 rounded-2xl p-12 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to join the safety network?</h2>
                <p className="text-xl mb-8 opacity-90">Sign up today to protect yourself and your community.</p>
                <a href="/register" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
                    Get Started Now
                </a>
            </div>
        </div>
    );
};

export default HowItWorks;
