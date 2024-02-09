import React from 'react';
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
import {sendHeartbeat} from "@/service_components/SocketApi";
import moment from "moment";

const MessageReceivedModal = ({requestData, isOpen, onClose, ...props}) => {

    const onAcknowledge = () => {
        sendHeartbeat(requestData.request_id);
        onClose();
    }

    const readableTime = requestData ? moment(requestData.heartbeat_deadline).format("h:mm a") : "";

    console.log(requestData)

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Are you still there?</ModalHeader>
                <ModalBody>
                    <Text>
                    It looks like the queue has lots of people who may not be still here. The staff member has sent a request to all students in the queue to check if they are still there.
                    </Text>
                    <Text mt={4} fontWeight={'bold'}>
                        Please click the acknowledge button by {readableTime} to keep your place in the queue.
                    </Text>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme={'green'} onClick={onAcknowledge}>Acknowledge</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
export default MessageReceivedModal;
