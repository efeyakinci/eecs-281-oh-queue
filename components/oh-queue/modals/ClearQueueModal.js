import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Text,
    VStack
} from "@chakra-ui/react";
import React, {useState} from "react";
import {clearQueue, requestHeartbeat, sendMessage} from "@/service_components/SocketApi";

const SendMessageModal = ({isOpen, onClose, queueId, ...props}) => {
    const [timeToRespond, setTimeToRespond] = useState(5);

    const onClearQueue = () => {
        clearQueue(queueId);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Clear Queue</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <Text>This will remove all students currently in the queue. <strong>There is no undo button for this operation!</strong></Text>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClearQueue} colorScheme="red" mr={4}>Clear Queue</Button>
                    <Button onClick={onClose} >Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SendMessageModal;