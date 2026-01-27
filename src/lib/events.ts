type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const events = {
    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    emit: () => {
        listeners.forEach(l => l());
    }
};
