const EVENT_NAME = 'ai-counsellor:refresh';

export const events = {
    subscribe: (listener: () => void) => {
        const handler = () => listener();
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    },
    emit: () => {
        console.log(`[Event] Emitting ${EVENT_NAME}`);
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }
};
