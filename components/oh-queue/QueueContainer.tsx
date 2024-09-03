import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
    queryIfStaff,
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
import {useErrorToast} from "@/hooks/useErrorToast";
import {string} from "prop-types";
import { AvailableQueue } from '@/types/QueueTypes';


const QueueContainer = (props: any) => {
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

    const [availableQueues, setAvailableQueues] = useState<{[k :string]: AvailableQueue}>({});
    const [isQueueSelectorOpen, setIsQueueSelectorOpen] = useState(true);
    const queueSelectorVariants = {
        closed: {
            flex: 0
        },
        open: {
            flex: 2
        }
    }

    const errorToast = useErrorToast();
    const toast = useToast();
    const router = useRouter();

    const canShowNotifications = useMemo(() => {
        return typeof Notification !== 'undefined';
    }, []);

    const checkNotificationPermission = useCallback(() => {
        if (!canShowNotifications) return;

        if (Notification.permission === 'default') {
            Notification.requestPermission();
            toast({
                title: "Notifications",
                description: "Make sure to allow notifications to receive updates from the queue!",
                status: "info",
                position: "top",
                duration: 5000,
                isClosable: true
            });
        }

        const warningShown = parseInt(localStorage.getItem('notificationWarningShown') ?? '0');


        if (canShowNotifications && Notification.permission === 'denied' && warningShown < 3) {
            toast({
                title: "Notifications",
                description: "You have disabled notifications. Keep an eye out on the queue for messages that may require you to respond for you to keep your spot in line!",
                status: "warning",
                position: "top",
                duration: 5000,
                isClosable: true
            });

            const warningShown = parseInt(localStorage.getItem('notificationWarningShown') ?? '0');
            localStorage.setItem('notificationWarningShown', (warningShown + 1).toString());
        }
    }, [canShowNotifications, toast]);

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
            setReceivedMessage({
                message: data.message,
                isMessageReceived: true
            });

            if (canShowNotifications && Notification.permission === 'granted') {
                console.log("Sending notification");
                new Notification('Message Received', {
                    body: 'Message from staff: ' + data.message,
                    icon: '/favicon.ico'
                });
            }
        });

        const onHeartbeatReceivedCleanup = setOnHeartbeat((data) => {
            setHeartbeat({
                showModal: true,
                heartbeatRequest: data
            });

            if (canShowNotifications && Notification.permission === 'granted') {
                console.log("Sending notification");
                new Notification('Heartbeat Request', {
                    body: 'Go back to the queue and acknowledge the request to keep your spot in line!',
                    icon: '/favicon.ico'
                });
            }
        });

        const errorHandlerCleanup = setErrorMessageHandler(({error}) => {
            errorToast(error);
        });

        return () => {
            beingHelpedCleanup();
            onMessageReceivedCleanup();
            onHeartbeatReceivedCleanup();
            errorHandlerCleanup();
        }
    }, [errorToast, canShowNotifications, checkNotificationPermission]);

    const isStaff = useQueueStore(state => state.isUserStaff);
    const selectedQueueId = useQueueStore(state => state.selectedQueueId);
    const setSelectedQueue = useQueueStore(state => state.setSelectedQueue);

    const onSelectQueueId = (queueId: string) => {
        setSelectedQueue(prevQueueSelection => {
            if (prevQueueSelection.selectedQueueId) {
                unsubscribeFromQueue(prevQueueSelection.selectedQueueId);
            }
            subscribeToQueue(queueId);
            return {selectedQueueId: queueId, selectedQueueName: availableQueues[queueId].queue_name, selectedQueueClass: availableQueues[queueId].class_name}
        });
        router.replace(`/queues/${queueId}`, `/queues/${queueId}`, {shallow: true});
    }


    return (
        <Flex justify={"center"} align={"center"} {...props}>
            <VStack w={['100%']} h={'100%'} align={'flex-start'}>
                <Flex w={'100%'} h={'100%'} flexDir={['column', 'row']}>
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
                    <Flex w={'100%'} mt={8} flexDirection={['column-reverse', 'row']}>
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
                </Flex>
            </VStack>

            <BeingHelpedModal isOpen={beingHelped.showModal} isBeingHelped={beingHelped.beingHelped} onClose={() => setBeingHelped({showModal: false, beingHelped: false})} />
            <MessageReceivedModal isOpen={receivedMessage.isMessageReceived} message={receivedMessage.message} onClose={() => setReceivedMessage({message: "", isMessageReceived: false})} />
            <RespondToHeartbeatModal isOpen={heartbeat.showModal} requestData={heartbeat.heartbeatRequest} onClose={() => setHeartbeat({showModal: false, heartbeatRequest: {}})} />
        </Flex>
    );
};

export default QueueContainer;
