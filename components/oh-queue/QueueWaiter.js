import React, {useContext, useState} from 'react';
import {Box, Button, Fade, Flex, HStack, Icon, Link, Spacer, Text, VStack} from "@chakra-ui/react";
import {
    IoArrowUndoCircle,
    IoChatbubbleEllipses, IoCheckmarkCircle, IoEnter,
    IoHandRight,
    IoHelpCircle, IoHourglass,
    IoLocation, IoPause, IoPauseCircle,
    IoPerson,
    IoPin, IoPulse, IoRemoveCircle,
    IoTime, IoWifi
} from "react-icons/io5";
import moment from "moment";
import {Span} from "next/dist/server/lib/trace/tracer";
import {AnimatePresence, motion} from "framer-motion";
import {useUserStore} from "@/stores/UserStore";
import {MotionBox, MotionVStack} from "@/components/motion-components/motion-components";
import QueueContext from "@/components/contexts/QueueContext";
import {doneHelpingStudent, helpStudent, leaveQueue, markStudentAsWaiting} from "@/service_components/SocketApi";
import SendMessageModal from "@/components/oh-queue/modals/SendMessageModal";

const attributeToIcon = {
    'help_description': IoHelpCircle,
    'location': IoLocation,
    'sign_up_time': IoTime,
    'time_requested': IoHourglass,
    'in_waiting_room': IoPauseCircle,
    'being_helped': IoHandRight,
}

function QueueWaiter({waiter, onLeaveQueue, onHelpStudent, onPinStudent, ...props}) {

    const isStaff = useUserStore(state => state.isStaff);
    const isLoggedIn = useUserStore(state => state.isLoggedIn);
    const loggedInUniqname = useUserStore(state => state.uniqname);

    const [showMessageModal, setShowMessageModal] = useState(false);

    const { selectedQueue } = useContext(QueueContext);

    const processAttribute = (key, value) => {
        if (key === 'sign_up_time') {
            return moment(value).fromNow();
        } else if (key === 'time_requested') {
            return "Expected to take " + value + " minutes";
        }
        return value;
    }

    const processTopAttribute = (key, value) => {
        if (key === 'in_waiting_room' && value === true) {
            return <Icon as={attributeToIcon[key]} boxSize={6} />
        } else if (key === 'being_helped' && value === true) {
            return <Icon as={attributeToIcon[key]} boxSize={6} />
        }
        return <></>
    }

    return (
        <MotionVStack
            boxShadow={'md'}
            p={4}
            align={'flex-start'}
            borderRadius={8}
            borderWidth={1}
            borderColor={'gray.200'}
            {...props}>
            <VStack align={'flex-start'} spacing={1} w={'100%'}>
                <Flex justify={'space-between'} w={'100%'}>
                    <HStack flex={1}>
                        <Icon as={IoPerson} boxSize={4}/>
                        <Text fontWeight={'bold'}>{waiter.name}</Text>
                        {waiter.uniqname && <Text>({waiter.uniqname})</Text>}
                    </HStack>
                    <HStack flex={1} flexDir={'row-reverse'}>
                        <Fade in><Icon color={'green'} as={IoPulse} boxSize={6} /></Fade>
                        {Object.entries(waiter.top_attributes).map(([key, value]) =>
                            <Fade in key={key}>{processTopAttribute(key, value)}</Fade>
                        )}
                    </HStack>
                </Flex>

                {Object.entries(waiter.attributes).map(([key, value]) => (
                    <HStack key={key}>
                        <Icon as={attributeToIcon[key]} boxSize={4}/>
                        <Text>{processAttribute(key, value)}</Text>
                    </HStack>
                ))}

                {isStaff && <QueueWaiterStaffActions
                    onHelp={(help) => helpStudent(selectedQueue.id, waiter.uid, help)}
                    onDone={() => doneHelpingStudent(selectedQueue.id, waiter.uid)}
                    onPin={() => markStudentAsWaiting(selectedQueue.id, waiter.uid, !waiter.top_attributes.in_waiting_room)}
                    onMessage={() => {setShowMessageModal(true)}}
                    waiter={waiter}
                    mt={4}/>}
                {isLoggedIn && loggedInUniqname === waiter.uniqname &&
                    <QueueWaiterSelfActionButtons
                        waiter = {waiter}
                        onStopWaiting = {() => markStudentAsWaiting(selectedQueue.id, waiter.uid, false)}
                        onLeave={() => leaveQueue(selectedQueue.id, waiter.uid)}
                        mt={4}/>}
            </VStack>

            <SendMessageModal
                isOpen={showMessageModal}
                queueId={selectedQueue.id}
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

            <QueueWaiterActionButton
                key={'message'}
                leftIcon={<Icon as={IoChatbubbleEllipses} boxSize={4}/>}
                colorScheme={'yellow'}
                >Message Staff</QueueWaiterActionButton>
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