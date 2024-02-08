import React, {useContext, useState} from 'react';
import {Box, Button, Flex, HStack, Icon, Link, Spacer, Text, VStack} from "@chakra-ui/react";
import {
    IoArrowUndoCircle,
    IoChatbubbleEllipses, IoCheckmarkCircle, IoEnter,
    IoHandRight,
    IoHelpCircle, IoHourglass,
    IoLocation,
    IoPerson,
    IoPin, IoRemoveCircle,
    IoTime
} from "react-icons/io5";
import moment from "moment";
import {Span} from "next/dist/server/lib/trace/tracer";
import {motion} from "framer-motion";
import {useUserStore} from "@/stores/UserStore";
import {MotionVStack} from "@/components/motion-components/motion-components";
import QueueContext from "@/components/oh-queue/QueueContext";
import {doneHelpingStudent, helpStudent, leaveQueue, pinStudent} from "@/service_components/SocketApi";
import SendMessageModal from "@/components/oh-queue/modals/SendMessageModal";

const attributeToIcon = {
    'help_description': IoHelpCircle,
    'location': IoLocation,
    'sign_up_time': IoTime,
    'time_requested': IoHourglass,
    'pinned': IoPin,
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
        if (key === 'pinned' && value === true) {
            return <Icon as={attributeToIcon[key]} boxSize={6} />;
        } else if (key === 'being_helped' && value === true) {
            return <Icon as={attributeToIcon[key]} boxSize={6} />;
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
                        {Object.entries(waiter.top_attributes).map(([key, value]) => (
                            processTopAttribute(key, value)
                        ))}
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
                    onPin={() => pinStudent(selectedQueue.id, waiter.uid, !waiter.top_attributes.pinned)}
                    onMessage={() => {setShowMessageModal(true)}}
                    waiter={waiter}
                    mt={4}/>}
                {isLoggedIn && loggedInUniqname === waiter.uniqname &&
                    <QueueWaiterSelfActionButtons
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
            <QueueWaiterActionButton
                leftIcon={<Icon as={waiter.top_attributes.being_helped ? IoCheckmarkCircle : IoHandRight} boxSize={4}/> }
                colorScheme={'green'}
                onClick={waiter.top_attributes.being_helped ? onDone : () => onHelp(true)}>
                {waiter.top_attributes.being_helped ? "Done" : "Help"}
            </QueueWaiterActionButton>
            {waiter.top_attributes.being_helped &&
                <QueueWaiterActionButton
                leftIcon={<Icon as={IoArrowUndoCircle} boxSize={4}/>}
                colorScheme={'red'}
                onClick={() => onHelp(false)}
                >
                    Undo
                </QueueWaiterActionButton>
            }
            <QueueWaiterActionButton
                leftIcon={<Icon as={IoPin} boxSize={4}/>}
                colorScheme={'blue'}
                onClick={onPin}>
                {waiter.top_attributes.pinned ? "Unpin" : "Pin"}
            </QueueWaiterActionButton>
            <QueueWaiterActionButton
                leftIcon={<Icon as={IoChatbubbleEllipses} boxSize={4}/>}
                colorScheme={'yellow'}
                onClick={onMessage}>Message</QueueWaiterActionButton>

            <QueueWaiterActionButton
                leftIcon={<Icon as={IoEnter} boxSize={4}/>}
                colorScheme={'orange'}
                onClick={() => {window.open(`https://eecs281a.eecs.umich.edu/submission/${waiter.uniqname}`)}}>Autograder</QueueWaiterActionButton>
        </HStack>
    );
}

function QueueWaiterSelfActionButtons({onLeave, onMessage, ...props}) {
    return (
        <HStack {...props}>
            <QueueWaiterActionButton
                leftIcon={<Icon as={IoRemoveCircle} boxSize={4}/> }
                colorScheme={'red'}
                onClick={onLeave}>Leave Queue</QueueWaiterActionButton>
            <QueueWaiterActionButton
                leftIcon={<Icon as={IoChatbubbleEllipses} boxSize={4}/>}
                colorScheme={'yellow'}
                >Message Staff</QueueWaiterActionButton>
        </HStack>
    );
}

function QueueWaiterActionButton(props) {
    return (
        <Link>
        <Button
            size={'sm'}
            boxShadow={'base'}
            {...props}/>
        </Link>
    );
}

export default QueueWaiter;