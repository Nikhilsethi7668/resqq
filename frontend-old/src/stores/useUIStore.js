import { create } from 'zustand';

const useUIStore = create((set) => ({
    isBlinking: false,
    alertMessage: '',
    startBlinking: (message) => set({ isBlinking: true, alertMessage: message }),
    stopBlinking: () => set({ isBlinking: false, alertMessage: '' }),
}));

export default useUIStore;
