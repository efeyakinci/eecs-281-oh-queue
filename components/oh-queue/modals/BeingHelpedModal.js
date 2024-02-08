import React from 'react';
import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay
} from "@chakra-ui/react";

const helpedData = {
    title: "You are being helped!",
    body: "A staff member will be with you shortly.",
    buttonColorScheme: "green"
}

const noLongerBeingHelpedData = {
    title: "You are no longer being helped",
    body: "Uh oh. It looks like the staff member who was trying to help you couldn't help you. You might want to speak with them to figure out what happened.",
    buttonColorScheme: "red"
}

const BeingHelpedModal = ({isBeingHelped, isOpen, onClose, ...props}) => {

    const data = isBeingHelped ? helpedData : noLongerBeingHelpedData;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{data.title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {data.body}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} colorScheme={data.buttonColorScheme}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BeingHelpedModal;
