import React, {useEffect, useState} from 'react';
import {Box, Button, Divider, Flex, HStack, SimpleGrid, Spacer, useColorMode, VStack} from "@chakra-ui/react";
import QueueList from "@/components/oh-queue/QueueList";
import QueueAnnouncements from "@/components/oh-queue/QueueAnnouncements";
import QueueSignup from "@/components/oh-queue/QueueSignup";
import {useUserStore} from "@/stores/UserStore";
import QueueManager from "@/components/oh-queue/QueueManager";
import {motion} from "framer-motion";
import {MotionVStack} from "@/components/motion-components/motion-components";
import QueueSelector from "@/components/oh-queue/QueueSelector";
import QueueContext from "@/components/oh-queue/QueueContext";
import api from "@/service_components/api";
import {
    setOnBeingHelped,
    setOnMessageReceived,
    subscribeToQueue,
    unsubscribeFromQueue
} from "@/service_components/SocketApi";
import OfficeHoursStatusDescriptor from "@/components/oh-queue/OfficeHoursStatusDescriptor";
import BeingHelpedModal from "@/components/oh-queue/modals/BeingHelpedModal";
import MessageReceivedModal from "@/components/oh-queue/modals/MessageReceivedModal";


const QueueContainer = (props) => {
    const [beingHelped, setBeingHelped] = useState({
        showModal: false,
        beingHelped: false
    });

    const [receivedMessage,setReceivedMessage] = useState({
        message: "",
        isMessageReceived: false
    });

    const [selectedQueue, setSelectedQueue] = useState({
        id: undefined,
        queueName: undefined
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

    useEffect(() => {
        api.get_queues().then((response) => {
            setAvailableQueues(response.data);
        });

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

        return () => {
            beingHelpedCleanup();
            onMessageReceivedCleanup();
        }
    }, []);

    const isStaff = useUserStore(state => state.isStaff);

    const onSelectQueueId = (queueId) => {
        setSelectedQueue(prevQueueSelection => {
            if (prevQueueSelection.id) {
                unsubscribeFromQueue(prevQueueSelection.id);
            }
            subscribeToQueue(queueId);
            return {id: queueId, selectedQueueName: availableQueues[queueId]}
        });
    }

    return (
        <Flex justify={"center"} align={"center"} {...props}>
            <VStack w={['100%']} h={'100%'} align={'flex-start'}>
                <Flex w={'100%'} h={'100%'}>
                    <QueueContext.Provider value={{selectedQueue, setSelectedQueue}}>
                    <QueueSelector
                        variants={queueSelectorVariants}
                        initial={"open"}
                        animate={isQueueSelectorOpen ? "open" : "closed"}
                        isOpen={isQueueSelectorOpen}
                        selectedQueueId={selectedQueue.id}
                        setSelectedQueueId={onSelectQueueId}
                        availableQueues={availableQueues}
                        onToggle={() => setIsQueueSelectorOpen(prevState => !prevState)}
                    />
                    <MotionVStack flex={5} layout mx={8}>
                    <QueueAnnouncements w={'100%'}/>
                    <Flex w={'100%'} mt={8} spacing={16} columns={2}>
                        <QueueList flex={[10, 9, 8]}/>
                        <Box w={16} />
                        <VStack flex={'4'} spacing={8}>
                        {isStaff && <QueueManager w={'100%'}/>}
                        {isStaff && <Divider />}
                        <QueueSignup w={'100%'} />
                        </VStack>
                    </Flex>
                    </MotionVStack>
                    <MotionVStack flex={'1'} layout />
                    </QueueContext.Provider>
                </Flex>
            </VStack>

            <BeingHelpedModal isOpen={beingHelped.showModal} isBeingHelped={beingHelped.beingHelped} onClose={() => setBeingHelped({showModal: false, beingHelped: false})} />
            <MessageReceivedModal isOpen={receivedMessage.isMessageReceived} message={receivedMessage.message} onClose={() => setReceivedMessage({message: "", isMessageReceived: false})} />
        </Flex>
    );
};

export default QueueContainer;
