import React, {useEffect, useState} from 'react';
import {Box, Divider, Flex, useToast, VStack} from "@chakra-ui/react";
import QueueList from "@/components/oh-queue/QueueList";
import QueueAnnouncements from "@/components/oh-queue/QueueAnnouncements";
import QueueSignup from "@/components/oh-queue/QueueSignup";
import {useUserStore} from "@/stores/UserStore";
import QueueManager from "@/components/oh-queue/QueueManager";
import {MotionVStack} from "@/components/motion-components/motion-components";
import QueueSelector from "@/components/oh-queue/QueueSelector";
import api from "@/service_components/api";
import {
    setErrorMessageHandler,
    setOnBeingHelped,
    setOnHeartbeat,
    setOnMessageReceived,
    subscribeToQueue,
    unsubscribeFromQueue
} from "@/service_components/SocketApi";
import BeingHelpedModal from "@/components/oh-queue/modals/BeingHelpedModal";
import MessageReceivedModal from "@/components/oh-queue/modals/MessageReceivedModal";
import RespondToHeartbeatModal from "@/components/oh-queue/modals/RespondToHeartbeatModal";
import QueueStatusContext from "@/components/contexts/QueueStatusContext";
import useQueueStore from "@/stores/QueueStore";
import {errorToast} from "@/components/oh-queue/Toasts";
import {useRouter} from "next/router";


const QueueContainer = (props) => {
    const [beingHelped, setBeingHelped] = useState({
        showModal: false,
        beingHelped: false
    });

    const [receivedMessage,setReceivedMessage] = useState({
        message: "",
        isMessageReceived: false
    });

    const [queueStatus, setQueueStatus] = useState({});

    const [heartbeat, setHeartbeat] = useState({
        showModal: false,
        heartbeatRequest: {}
    });

    const [availableQueues, setAvailableQueues] = useState({});
    const [isQueueSelectorOpen, setIsQueueSelectorOpen] = useState(true);
    const queueSelectorVariants = {
        closed: {
            flex: 1
        },
        open: {
            flex: 2
        }
    }

    const toast = useToast();
    const router = useRouter();

    const checkNotificationPermission = () => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

    }

    useEffect(() => {
        api.get_queues().then((response) => {
            setAvailableQueues(response.data);
        });

        checkNotificationPermission();

        const beingHelpedCleanup = setOnBeingHelped((data) => {
            console.log("Being helped")
            setBeingHelped({
                showModal: true,
                beingHelped: data.is_helped
            })
        });

        const onMessageReceivedCleanup = setOnMessageReceived((data) => {
            console.log("Message received")
            setReceivedMessage({
                message: data.message,
                isMessageReceived: true
            })
        });

        const onHeartbeatReceivedCleanup = setOnHeartbeat((data) => {
            setHeartbeat({
                showModal: true,
                heartbeatRequest: data
            });

            if (Notification.permission === 'granted') {
                new Notification('Heartbeat Request', {
                    body: 'Go back to the queue and acknowledge the request to keep your spot in line!',
                    icon: '/heart-icon.webp'
                });
            }
        });

        const errorHandlerCleanup = setErrorMessageHandler(({error}) => {
            toast(errorToast(error))
        });

        return () => {
            beingHelpedCleanup();
            onMessageReceivedCleanup();
            onHeartbeatReceivedCleanup();
            errorHandlerCleanup();
        }
    }, [toast]);

    const isStaff = useUserStore(state => state.isStaff);

    const selectedQueueId = useQueueStore(state => state.selectedQueueId);
    const setSelectedQueue = useQueueStore(state => state.setSelectedQueue);

    const onSelectQueueId = (queueId) => {
        setSelectedQueue(prevQueueSelection => {
            if (prevQueueSelection.selectedQueueId) {
                unsubscribeFromQueue(prevQueueSelection.selectedQueueId);
            }
            subscribeToQueue(queueId);
            return {selectedQueueId: queueId, selectedQueueName: availableQueues[queueId]}
        });
        router.replace(`/queues/${queueId}`, `/queues/${queueId}`, {shallow: true});
    }


    return (
        <Flex justify={"center"} align={"center"} {...props}>
            <VStack w={['100%']} h={'100%'} align={'flex-start'}>
                <Flex w={'100%'} h={'100%'} flexDir={['column', 'row']}>
                    <QueueStatusContext.Provider value={{queueStatus, setQueueStatus}}>
                    <QueueSelector
                        variants={queueSelectorVariants}
                        initial={"open"}
                        animate={isQueueSelectorOpen ? "open" : "closed"}
                        isOpen={isQueueSelectorOpen}
                        selectedQueueId={selectedQueueId}
                        setSelectedQueueId={onSelectQueueId}
                        availableQueues={availableQueues}
                        onToggle={() => setIsQueueSelectorOpen(prevState => !prevState)}
                    />
                    <MotionVStack flex={5} layout mx={8}>
                    <QueueAnnouncements w={'100%'}/>
                    <Flex w={'100%'} mt={8} spacing={16} columns={2} flexDirection={['column-reverse', 'row']}>
                        <QueueList flex={[10, 9, 8]} pt={4}/>
                        <Box w={16} />
                        <VStack flex={'4'} spacing={8}>
                        {isStaff && <QueueManager w={'100%'}/>}
                        {isStaff && <Divider />}
                        <QueueSignup w={'100%'} />
                        </VStack>
                    </Flex>
                    </MotionVStack>
                    <MotionVStack flex={'1'} layout />
                    </QueueStatusContext.Provider>
                </Flex>
            </VStack>

            <BeingHelpedModal isOpen={beingHelped.showModal} isBeingHelped={beingHelped.beingHelped} onClose={() => setBeingHelped({showModal: false, beingHelped: false})} />
            <MessageReceivedModal isOpen={receivedMessage.isMessageReceived} message={receivedMessage.message} onClose={() => setReceivedMessage({message: "", isMessageReceived: false})} />
            <RespondToHeartbeatModal isOpen={heartbeat.showModal} requestData={heartbeat.heartbeatRequest} onClose={() => setHeartbeat({showModal: false, heartbeatRequest: {}})} />
        </Flex>
    );
};

export default QueueContainer;
