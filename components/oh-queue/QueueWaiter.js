import React, {useCallback, useEffect, useState} from 'react';
import {Box, Button, Fade, Flex, HStack, Icon, Image, Link, Text, Tooltip, VStack} from "@chakra-ui/react";
import {
    IoArrowUndoCircle,
    IoChatbubbleEllipses,
    IoCheckmarkCircle,
    IoEnter, IoFlashOff,
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

function QueueWaiter({waiter, ...props}) {

    const isStaff = useQueueStore(state => state.isUserStaff);
    const isLoggedIn = useUserStore(state => state.isLoggedIn);
    const loggedInUniqname = useUserStore(state => state.uniqname);

    const waiterRef = React.useRef(waiter);

    const [showMessageModal, setShowMessageModal] = useState(false);

    const selectedQueueId = useQueueStore(state => state.selectedQueueId);


    const processAttribute = useCallback((key, value) => {
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
                return null;
        }
    }, [])

    const processTopAttributes = useCallback((attributes) => {
        const returnElements = []

        if (attributes.in_waiting_room) {
            returnElements.push(
                <Tooltip label={'In waiting room'} key={'in_waiting_room'} placement={'top'}>
                    <Flex align={'center'} boxSize={8}>
                        <Image src={'/eepy-cat.svg'} />
                    </Flex>
                </Tooltip>
            )
        }

        if (attributes.being_helped) {
            returnElements.push(
                <Icon as={IoHandRight} boxSize={6} />
            )
        }

        if (attributes.is_online !== undefined) {
            returnElements.push(
                <Box>
                <Icon as={IoPulse} h={6} w={6} color={attributes.is_online ? "green" : "red"} />
                </Box>
            )
        }

        if (attributes.helped_today) {
            returnElements.push(
                <Tooltip label={'Helped today'} key={'helped_today'} placement={'top'}>
                    <Flex boxSize={8}>
                        <Image src={'/low-energy-cat.svg'} />
                    </Flex>
                </Tooltip>
            )
        }

        return returnElements
    }, []);

    const processAttributes = useCallback((attributes) => {
        return Object.entries(attributes).map(([key, value]) => (
            processAttribute(key, value)
        ));
    }, [processAttribute])

    const [attributes, setAttributes] = useState(processAttributes(waiter.attributes));

    useEffect(() => {
        setAttributes(processAttributes(waiter.attributes));

        const attributeRefreshInterval = setInterval(() => {
            setAttributes(processAttributes(waiterRef.current.attributes));
        }, 1000 * 20);

        return () => {
            clearInterval(attributeRefreshInterval);
        }
    }, [processAttributes, waiter])

    useEffect(() => {
        waiterRef.current = waiter;
    }, [waiter])

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
                    <HStack flexDir={'row-reverse'} spacing={3}>
                        {processTopAttributes(waiter.attributes).map((icon, i) => {
                            if (icon) {
                                return (
                                    <Fade in key={i}>
                                        {icon}
                                    </Fade>
                                );
                            }
                            return null;
                        })}
                    </HStack>
                </Flex>

                {attributes}
                {isStaff && <QueueWaiterStaffActions
                    onHelp={(help) => helpStudent(selectedQueueId, waiter.uid, help)}
                    onDone={() => doneHelpingStudent(selectedQueueId, waiter.uid)}
                    onPin={() => markStudentAsWaiting(selectedQueueId, waiter.uid, !waiter.attributes.in_waiting_room)}
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
        <Flex flexWrap={'wrap'} {...props}>
            <AnimatePresence initial={false}>
            <QueueWaiterActionButton
                key={'help'}
                leftIcon={<Icon as={waiter.attributes.being_helped ? IoCheckmarkCircle : IoHandRight} boxSize={4}/> }
                colorScheme={'green'}
                onClick={waiter.attributes.being_helped ? onDone : () => onHelp(true)}>
                {waiter.attributes.being_helped ? "Done" : "Help"}
            </QueueWaiterActionButton>
            {waiter.attributes.being_helped &&
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
                {waiter.attributes.in_waiting_room ? "Bring Back to Queue" : "Mark as Waiting"}
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
        </Flex>
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
            {waiter.attributes.in_waiting_room &&
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
            m={1}
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