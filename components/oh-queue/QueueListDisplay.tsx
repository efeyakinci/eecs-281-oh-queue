import React, {useEffect} from 'react';
import {MotionBox} from "@/components/motion-components/motion-components";
import QueueWaiterItem from "@/components/oh-queue/QueueWaiter";
import {AnimatePresence} from "framer-motion";
import useQueueStore from "@/stores/QueueStore";
import {useUserStore} from "@/stores/UserStore"
import {QueueWaiter} from "@/types/QueueTypes";

type QueueListDisplayProps = {
    waiters: QueueWaiter[]
}

const QueueListDisplay: React.FC<QueueListDisplayProps> = ({waiters}) => {

    const setQueueStatus = useQueueStore(state => state.setStatus);
    const loggedInUser = useUserStore(state => state.uniqname);

    useEffect(() => {
        const queueUser = waiters.find(waiter => waiter.uniqname === loggedInUser);
        const userInQueue = queueUser !== undefined;
        const signedUpUid = userInQueue ? queueUser.uid : undefined;

        setQueueStatus(status => ({...status, userInQueue, signedUpUid}));
    }, [waiters, loggedInUser, setQueueStatus]);

    return (
        <>
            {waiters.map((person) => (
                <MotionBox
                    w={'100%'}
                    key={person.uid}
                    layout
                    initial={{opacity: 1, y:0, scaleY: 0, originY: 0}}
                    animate={{opacity: 1, y:0, scaleY: 1}}
                    exit={{opacity: 0, y:-20}}
                    transition={{duration: 0.25}}
                >
                    <QueueWaiterItem
                        w={'100%'}
                        waiter={person}
                    />
                </MotionBox>
            ))}
        </>
    );
};

export default QueueListDisplay;
