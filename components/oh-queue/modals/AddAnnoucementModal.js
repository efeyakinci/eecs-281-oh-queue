import {
    Button, Flex, FormControl, FormHelperText, FormLabel,
    Heading, HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    RadioGroup, Switch,
    Text, Textarea,
    VStack
} from "@chakra-ui/react";
import React, {useState} from "react";
import {addAnnouncement, overrideQueueSchedule} from "@/service_components/SocketApi";
import {Formik} from "formik";
import moment from "moment";
import {MotionBox} from "@/components/motion-components/motion-components";


const AddAnnoucementModal = ({queueId, isOpen, onClose, ...props}) => {

    const [formState, setFormState] = useState({
        message: '',
        useEffectiveUntil: false,
        effectiveUntil: moment().format('YYYY-MM-DDTHH:mm')
    });

    const onAddAnnoucement = () => {
        const announcement = {
            message: formState.message,
        }
        if (formState.useEffectiveUntil) {
            announcement.until = formState.effectiveUntil;
        }

        addAnnouncement(queueId, announcement);
        onClose();
    }

    const setFormValue = (key, value) => {
        setFormState({...formState, [key]: value});
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Add Annoucement</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <VStack spacing={4}>
                    <Textarea placeholder={'Announcement'}
                                value={formState.message}
                                onChange={(e) => setFormValue('message', e.target.value)}/>
                        <HStack w={'100%'} justify={'flex-start'} align={'center'}>
                        <FormLabel mb={0}>
                            Effective Until Certain Date
                        </FormLabel>
                        <Switch
                            isChecked={formState.useEffectiveUntil}
                            onChange={(e) => setFormValue('useEffectiveUntil', e.target.checked)}
                            colorScheme="blue" />
                        </HStack>
                        <Input type={'datetime-local'}
                                 value={formState.effectiveUntil}
                                 onChange={(e) => setFormValue('effectiveUntil', e.target.value)}
                                 disabled={!formState.useEffectiveUntil}/>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onAddAnnoucement} colorScheme="blue" mr={4}>Add Annoucement</Button>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddAnnoucementModal;