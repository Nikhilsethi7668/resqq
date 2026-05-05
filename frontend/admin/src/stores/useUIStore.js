import { create } from 'zustand';

// Create audio instance once
const alertAudio = new Audio('/soundreality-civil-defense-siren-128262.mp3');

const useUIStore = create((set, get) => ({
    isBlinking: false,
    alertMessage: '',
    soundEnabled: localStorage.getItem("soundEnabled") !== "false", // Default to true if not set
    startBlinking: (message) => set({ isBlinking: true, alertMessage: message }),
    stopBlinking: () => set({ isBlinking: false, alertMessage: '' }),
    toggleSound: () => set((state) => {
        const newStatus = !state.soundEnabled;
        localStorage.setItem("soundEnabled", newStatus.toString());
        
        // Trick to unlock audio context on user interaction
        if (newStatus) {
            alertAudio.play().then(() => {
                alertAudio.pause();
                alertAudio.currentTime = 0;
            }).catch(e => console.log("Audio unlock failed", e));
        }
        
        return { soundEnabled: newStatus };
    }),
    playAlertSound: () => {
        const { soundEnabled } = get();
        if (soundEnabled) {
            // Reset to beginning in case it's already playing or was paused
            alertAudio.currentTime = 0;
            alertAudio.play().catch(e => console.error("Audio play failed:", e));
        }
    }
}));

export default useUIStore;
