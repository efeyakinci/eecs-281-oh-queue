import React, {useCallback, useEffect, useState} from 'react';
import {Button, Fade, Flex, HStack, Icon, Link, Text, VStack} from "@chakra-ui/react";
import {
    IoArrowUndoCircle,
    IoChatbubbleEllipses,
    IoCheckmarkCircle,
    IoEnter,
    IoHandRight,
    IoHelpCircle,
    IoHourglass,
    IoLocation,
    IoPauseCircle,
    IoPerson,
    IoPulse,
    IoRemoveCircle,
    IoTime
} from "react-icons/io5";
import moment from "moment";
import {AnimatePresence} from "framer-motion";
import {useUserStore} from "@/stores/UserStore";
import {MotionBox, MotionVStack} from "@/components/motion-components/motion-components";
import {doneHelpingStudent, helpStudent, leaveQueue, markStudentAsWaiting} from "@/service_components/SocketApi";
import SendMessageModal from "@/components/oh-queue/modals/SendMessageModal";
import useQueueStore from "@/stores/QueueStore";

const attributeToIcon = {
    'help_description': IoHelpCircle,
    'location': IoLocation,
    'sign_up_time': IoTime,
    'time_requested': IoHourglass,
    'in_waiting_room': IoPauseCircle,
    'being_helped': IoHandRight,
    'is_online': IoPulse
}

function QueueWaiter({waiter, onLeaveQueue, onHelpStudent, onPinStudent, ...props}) {

    const isStaff = useUserStore(state => state.isStaff);
    const isLoggedIn = useUserStore(state => state.isLoggedIn);
    const loggedInUniqname = useUserStore(state => state.uniqname);

    const waiterRef = React.useRef(waiter);

    const [showMessageModal, setShowMessageModal] = useState(false);

    const selectedQueueId = useQueueStore(state => state.selectedQueueId);


    const processAttribute = (key, value) => {
        console.log(value)
        switch (key) {
            case 'sign_up_time':
                return <WaiterAttribute key={key} icon={attributeToIcon[key]} value={moment(value).fromNow()} />
            case 'time_requested':
                return <WaiterAttribute key={key} icon={attributeToIcon[key]} value={'Expected to take ' + value + ' minutes'} />
            case 'location':
                return <WaiterAttribute key={key} icon={attributeToIcon[key]} value={value} />
            case 'help_description':
                return <WaiterAttribute key={key} icon={attributeToIcon[key]} value={value} />
            default:
                return <></>
        }
    }

    const processTopAttributes = (attributes) => {
        const returnElements = []

        if (attributes.in_waiting_room) {
            returnElements.push(<Icon as={IoPauseCircle} boxSize={6} />)
        }

        if (attributes.being_helped) {
            returnElements.push(<Icon as={IoHandRight} boxSize={6} />)
        }

        if (attributes.is_online !== undefined) {
            returnElements.push(<Icon as={IoPulse} boxSize={6} color={attributes.is_online ? "green" : "red"} />)
        }

        return returnElements
    }

    const processAttributes = useCallback((attributes) => {
        return Object.entries(attributes).map(([key, value]) => (
            processAttribute(key, value)
        ));
    }, [])

    const [attributes, setAttributes] = useState(processAttributes(waiter.attributes));

    useEffect(() => {
        const attributeRefreshInterval = setInterval(() => {
            setAttributes(processAttributes(waiterRef.current.attributes));
        }, 1000 * 10);

        return () => {
            clearInterval(attributeRefreshInterval);
        }
    }, [processAttributes, waiter])

    useEffect(() => {
        waiterRef.current = waiter;
    }, [waiter]);

    return (
        <MotionVStack
            boxShadow={'md'}
            p={4}
            align={'flex-start'}
            borderRadius={8}
            borderWidth={1}
            {...props}>
            <VStack align={'flex-start'} spacing={1} w={'100%'}>
                <Flex justify={'space-between'} w={'100%'}>
                    <HStack flex={1}>
                        <Icon as={IoPerson} boxSize={4}/>
                        <Text fontWeight={'bold'}>{waiter.name}</Text>
                        {waiter.uniqname && <Text>({waiter.uniqname})</Text>}
                    </HStack>
                    <HStack flex={1} flexDir={'row-reverse'}>
                        {processTopAttributes(waiter.top_attributes).map((icon, i) => {
                            return (
                            <Fade in key={i}>
                                {icon}
                            </Fade>
                            );
                        })}
                    </HStack>
                </Flex>

                {attributes}

                {isStaff && <QueueWaiterStaffActions
                    onHelp={(help) => helpStudent(selectedQueueId, waiter.uid, help)}
                    onDone={() => doneHelpingStudent(selectedQueueId, waiter.uid)}
                    onPin={() => markStudentAsWaiting(selectedQueueId, waiter.uid, !waiter.top_attributes.in_waiting_room)}
                    onMessage={() => {setShowMessageModal(true)}}
                    waiter={waiter}
                    mt={4}/>}
                {isLoggedIn && loggedInUniqname === waiter.uniqname &&
                    <QueueWaiterSelfActionButtons
                        waiter = {waiter}
                        onStopWaiting = {() => markStudentAsWaiting(selectedQueueId, waiter.uid, false)}
                        onLeave={() => leaveQueue(selectedQueueId, waiter.uid)}
                        mt={4}/>}
            </VStack>

            <SendMessageModal
                isOpen={showMessageModal}
                queueId={selectedQueueId}
                onClose={() => setShowMessageModal(false)}
                toUniqname={waiter.uniqname} />
        </MotionVStack>
    );
}

function QueueWaiterStaffActions({onHelp, onDone, onPin, onMessage, waiter, ...props}) {
    return (
        <HStack {...props}>
            <AnimatePresence initial={false}>
            <QueueWaiterActionButton
                key={'help'}
                leftIcon={<Icon as={waiter.top_attributes.being_helped ? IoCheckmarkCircle : IoHandRight} boxSize={4}/> }
                colorScheme={'green'}
                onClick={waiter.top_attributes.being_helped ? onDone : () => onHelp(true)}>
                {waiter.top_attributes.being_helped ? "Done" : "Help"}
            </QueueWaiterActionButton>
            {waiter.top_attributes.being_helped &&
                <QueueWaiterActionButton
                key={'undo'}
                leftIcon={<Icon as={IoArrowUndoCircle} boxSize={4}/>}
                colorScheme={'red'}
                onClick={() => onHelp(false)}
                >
                    Undo
                </QueueWaiterActionButton>
            }
            <QueueWaiterActionButton
                key={'waiting'}
                leftIcon={<Icon as={IoPauseCircle} boxSize={4}/>}
                colorScheme={'blue'}
                onClick={onPin}>
                {waiter.top_attributes.in_waiting_room ? "Bring Back to Queue" : "Mark as Waiting"}
            </QueueWaiterActionButton>
            <QueueWaiterActionButton
                key={'message_student'}
                leftIcon={<Icon as={IoChatbubbleEllipses} boxSize={4}/>}
                colorScheme={'yellow'}
                onClick={onMessage}>Message</QueueWaiterActionButton>

            <QueueWaiterActionButton
                key={'autograder'}
                leftIcon={<Icon as={IoEnter} boxSize={4}/>}
                colorScheme={'orange'}
                onClick={() => {window.open(`https://eecs281a.eecs.umich.edu/submission/${waiter.uniqname}`)}}>Autograder</QueueWaiterActionButton>
            </AnimatePresence>
        </HStack>
    );
}

function WaiterAttribute({icon, value, ...props}) {
    return (
        <HStack>
            <Icon as={icon} boxSize={4} {...props}/>
            <Text>{value}</Text>
        </HStack>
    );
}

function QueueWaiterSelfActionButtons({waiter, onLeave, onMessage, onStopWaiting, ...props}) {
    return (
        <HStack {...props}>
            <AnimatePresence initial={false}>
            <QueueWaiterActionButton
                key={'leave'}
                leftIcon={<Icon as={IoRemoveCircle} boxSize={4}/> }
                colorScheme={'red'}
                onClick={onLeave}>Leave Queue</QueueWaiterActionButton>
            {waiter.top_attributes.in_waiting_room &&
            <QueueWaiterActionButton
                key={'stop-waiting'}
                leftIcon={<Icon as={IoPauseCircle} boxSize={4}/>}
                colorScheme={'blue'}
                onClick={onStopWaiting}>
                Stop Waiting
            </QueueWaiterActionButton>
            }
            </AnimatePresence>
        </HStack>
    );
}

function QueueWaiterActionButton(props) {
    return (
        <MotionBox
            layout
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
        >
            <Link>
            <Button
                size={'sm'}
                boxShadow={'base'}
                {...props}/>
            </Link>
        </MotionBox>
    );
}

export default QueueWaiter;