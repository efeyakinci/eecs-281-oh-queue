import React, {useState} from 'react';
import {Button, Heading, Icon, SimpleGrid, VStack} from "@chakra-ui/react";
import {IoCalendar, IoFitness, IoMegaphone, IoSync, IoSyncCircle, IoTime, IoTrash} from "react-icons/io5";
import BroadcastMessageModal from "@/components/oh-queue/modals/BroadcastMessageModal";
import RequestHeartbeatModal from "@/components/oh-queue/modals/RequestHeartbeatModal";
import useQueueStore from "@/stores/QueueStore";
import ClearQueueModal from "@/components/oh-queue/modals/ClearQueueModal";
import ManualQueueOpenCloseModal from "@/components/oh-queue/modals/ManualQueueOpenCloseModal";
import SyncCalendarModal from "@/components/oh-queue/modals/SyncCalendarModal";

const QueueManager = ({queueLength, ...props}) => {
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [showRequestHeartbeatModal, setShowRequestHeartbeatModal] = useState(false);
    const [showClearQueueModal, setShowClearQueueModal] = useState(false);
    const [showManualQueueOpenCloseModal, setShowManualQueueOpenCloseModal] = useState(false);
    const [showSyncCalendarModal, setShowSyncCalendarModal] = useState(false);

    const selectedQueueId = useQueueStore(state => state.selectedQueueId);

    return (
        <VStack spacing={2} align={'flex-start'} borderRadius={8} {...props}>
            <Heading>Manage Queue</Heading>
            <SimpleGrid columns={1} w={'100%'} spacing={4} mt={4}>
                <Button
                    leftIcon={<Icon as={IoTrash} boxSize={4}/>}
                    colorScheme={'red'}
                    onClick={() => setShowClearQueueModal(true)}>
                    Clear Queue
                </Button>
                <Button
                    leftIcon={<Icon as={IoMegaphone} boxSize={4}/>}
                    colorScheme={'yellow'}
                    onClick={() => setShowBroadcastModal(true)}>
                    Broadcast Message
                </Button>
                <Button
                    leftIcon={<Icon as={IoFitness} boxSize={4}/>}
                    colorScheme={'purple'}
                    onClick={() => setShowRequestHeartbeatModal(true)}>
                    Ask for Heartbeat
                </Button>
                <Button
                    leftIcon={<Icon as={IoTime} boxSize={4}/>}
                    colorScheme={'orange'}
                    onClick={() => {setShowManualQueueOpenCloseModal(true)}}>
                    Manually Open/Close Queue
                </Button>
                <Button
                    leftIcon={<Icon as={IoSyncCircle} boxSize={4}/>}
                    colorScheme={'pink'}
                    onClick={() => {setShowSyncCalendarModal(true)}}>
                    Sync Calendar
                </Button>
            </SimpleGrid>

            <BroadcastMessageModal
                isOpen={showBroadcastModal}
                onClose={() => setShowBroadcastModal(false)}
                queueId={selectedQueueId} />
            <RequestHeartbeatModal
                isOpen={showRequestHeartbeatModal}
                onClose={() => setShowRequestHeartbeatModal(false)}
                queueId={selectedQueueId}/>
            <ClearQueueModal
                isOpen={showClearQueueModal}
                onClose={() => setShowClearQueueModal(false)}
                queueId={selectedQueueId}/>
            <ManualQueueOpenCloseModal
                isOpen={showManualQueueOpenCloseModal}
                onClose={() => setShowManualQueueOpenCloseModal(false)}
                queueId={selectedQueueId}/>
            <SyncCalendarModal
                isOpen={showSyncCalendarModal}
                onClose={() => setShowSyncCalendarModal(false)}
                queueId={selectedQueueId}/>
        </VStack>
    );
};

export default QueueManager;
