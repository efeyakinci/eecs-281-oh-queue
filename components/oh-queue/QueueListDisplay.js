import React, {useEffect} from 'react';
import {MotionBox} from "@/components/motion-components/motion-components";
import QueueWaiter from "@/components/oh-queue/QueueWaiter";
import {AnimatePresence} from "framer-motion";
import useQueueStore from "@/stores/QueueStore";
import {useUserStore} from "@/stores/UserStore";

const QueueListDisplay = ({waiters}) => {

    const setQueueStatus = useQueueStore(state => state.setStatus);
    const loggedInUser = useUserStore(state => state.uniqname);

    useEffect(() => {
        const userInQueue = waiters.some(waiter => waiter.uniqname === loggedInUser);
        console.log("User in queue", userInQueue)
        setQueueStatus(status => ({...status, userInQueue}))
    }, [waiters]);

    return (
        <AnimatePresence>
            {waiters.map((person, index) => (
                <MotionBox
                    w={'100%'}
                    key={person.uid}
                    layout
                    initial={{opacity: 1, y:0, scaleY: 0, originY: 0}}
                    animate={{opacity: 1, y:0, scaleY: 1}}
                    exit={{opacity: 0, y:-20}}
                    transition={{duration: 0.25}}
                >
                    <QueueWaiter
                        w={'100%'}
                        waiter={person}
                    />
                </MotionBox>
            ))}
        </AnimatePresence>
    );
};

export default QueueListDisplay;