import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text
} from "@chakra-ui/react";
import React, {useState} from "react";
import {syncCalendar} from "@/service_components/SocketApi";

const SyncCalendarModal = ({queueId, isOpen, onClose, ...props}) => {
    const [message, setMessage] = useState('');

    const onSync = () => {
        syncCalendar(queueId);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Sync Calendar</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text> Sync the Google Calendar with the current queue. </Text>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onSync} colorScheme="pink" mr={4}>Sync</Button>
                    <Button onClick={onClose} >Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SyncCalendarModal;