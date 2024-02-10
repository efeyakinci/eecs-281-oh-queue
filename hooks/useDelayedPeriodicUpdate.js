import {useEffect, useRef} from "react";

const useDelayedPeriodicUpdate = (callback, interval) => {
    const intervalRef = useRef(null);

    useEffect(() => {
        const msUntilNextMinute = 60 * 1000 - (Date.now() % (60 * 1000));
        const timeout = setTimeout(() => {
            callback();
            intervalRef.current = setInterval(callback, interval);
        }, msUntilNextMinute);

        return () => {
            clearInterval(intervalRef.current);
            clearTimeout(timeout);
        };
    }, []);
}

export default useDelayedPeriodicUpdate;