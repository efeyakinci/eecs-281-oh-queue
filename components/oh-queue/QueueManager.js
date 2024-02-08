import React, {useContext, useState} from 'react';
import {Button, HStack, Icon, SimpleGrid, VStack, Text, Heading, Divider} from "@chakra-ui/react";
import {IoFitness, IoMegaphone, IoPerson, IoTrash} from "react-icons/io5";
import OfficeHoursStatusDescriptor from "@/components/oh-queue/OfficeHoursStatusDescriptor";
import BroadcastMessageModal from "@/components/oh-queue/modals/BroadcastMessageModal";
import QueueContext from "@/components/oh-queue/QueueContext";

const QueueManager = ({queueLength, ...props}) => {
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const { selectedQueue } = useContext(QueueContext);

    return (
        <VStack spacing={2} align={'flex-start'} borderRadius={8} {...props}>
            <Heading>Manage Queue</Heading>
            <SimpleGrid columns={1} w={'100%'} spacing={4} mt={4}>
                <Button
                    leftIcon={<Icon as={IoTrash} boxSize={4}/>}
                    colorScheme={'red'}>
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
                    colorScheme={'purple'}>
                    Ask for Heartbeat
                </Button>
            </SimpleGrid>

            <BroadcastMessageModal
                isOpen={showBroadcastModal}
                onClose={() => setShowBroadcastModal(false)}
                queueId={selectedQueue.id} />
        </VStack>
    );
};

export default QueueManager;
