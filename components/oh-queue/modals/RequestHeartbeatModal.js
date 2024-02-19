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
import {requestHeartbeat, sendMessage} from "@/service_components/SocketApi";

const SendMessageModal = ({isOpen, onClose, queueId, ...props}) => {
    const [timeToRespond, setTimeToRespond] = useState(5);

    const onRequestHeartbeat = () => {
        requestHeartbeat(queueId, timeToRespond);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Request Heartbeat From Students</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <Text>When there are lots of students in the queue who have been waiting for a long time, it can be hard to know if they are still there. </Text>

                        <Text> You can send a request for a heartbeat to all students in the queue to check if they are still there. If they don&apos;t respond to the queue heartbeat by that time, they will be removed from the queue. </Text>

                        <NumberInput
                            defaultValue={8}
                            min={1}
                            max={40}
                            onChange={setTimeToRespond}>
                            <NumberInputField/>
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        <Text>(minutes)</Text>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onRequestHeartbeat} colorScheme="purple" mr={4}>Request Heartbeat</Button>
                    <Button onClick={onClose} >Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SendMessageModal;