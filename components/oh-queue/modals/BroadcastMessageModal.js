import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay, Spacer, Textarea
} from "@chakra-ui/react";
import React, {useState} from "react";
import {broadcastMessage, sendMessage} from "@/service_components/SocketApi";

const BroadcastMessageModal = ({queueId, isOpen, onClose, ...props}) => {
    const [message, setMessage] = useState('');

    const onMessageSend = () => {
        broadcastMessage(queueId, message);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Broadcast Message to Queue</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Textarea
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Office hours will be moving to BBB 1690!" />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onMessageSend} colorScheme="yellow" mr={4}>Broadcast</Button>
                    <Button onClick={onClose} >Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BroadcastMessageModal;