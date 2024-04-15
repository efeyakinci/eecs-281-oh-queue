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
import React, {useRef, useState} from "react";
import {sendMessage} from "@/service_components/SocketApi";

const SendMessageModal = ({queueId, toUniqname, isOpen, onClose, ...props}) => {
    const [message, setMessage] = useState('');
    const messageRef = useRef(null);

    const onMessageSend = () => {
        sendMessage(queueId, message, toUniqname);
        onClose();
    }

    return (
        <Modal
            initialFocusRef={messageRef}
            isOpen={isOpen}
            onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Send Message to {toUniqname}</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Textarea
                        ref={messageRef}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="I can't find you, are you still here?"/>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onMessageSend} colorScheme="yellow" mr={4}>Send</Button>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SendMessageModal;