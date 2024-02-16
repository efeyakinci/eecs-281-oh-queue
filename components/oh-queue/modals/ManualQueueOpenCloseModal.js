import {
    Button,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    RadioGroup,
    Text,
    VStack
} from "@chakra-ui/react";
import React from "react";
import {overrideQueueSchedule} from "@/service_components/SocketApi";
import {Formik} from "formik";
import moment from "moment";
import {MotionBox} from "@/components/motion-components/motion-components";


const ManualQueueOpenCloseModal = ({queueId, isOpen, onClose, ...props}) => {

    const onOverrideQueue = ({override_type, from_date_time, to_date_time}) => {
        console.log(override_type, from_date_time, to_date_time);
        overrideQueueSchedule(queueId, override_type, moment(from_date_time).unix(), moment(to_date_time).unix());
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <Formik initialValues={{override_type: "close", from_date_time: moment().format("YYYY-MM-DDTHH:mm"), to_date_time: moment().add(30, 'minutes').format("YYYY-MM-DDTHH:mm")}}
                        onSubmit={onOverrideQueue}>
                {({values, handleChange, handleBlur, handleSubmit}) => (
                    <>
                <ModalHeader>Manually Open/Close Queue</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Text> If you would like to manually open or close the queue during a certain time, this is the
                        place to be!</Text>
                            <form onSubmit={handleSubmit}>
                                <VStack mt={4} align={'flex-start'} spacing={4}>
                                    <Heading size={'md'}> Open or Close the Queue?</Heading>
                                    <RadioGroup name={'override_type'} onChange={(e) => handleChange({target: {name: 'override_type', value: e}})} onBlur={handleBlur} value={values.override_type}>
                                        <VStack>
                                            <Radio value="close">
                                                Close
                                            </Radio>
                                            <Radio value="open">
                                                Open
                                            </Radio>
                                        </VStack>
                                    </RadioGroup>

                                    <Heading size={'sm'}> From</Heading>
                                    <Input
                                        type={'datetime-local'}
                                        name={'from_date_time'}
                                        value={values.from_date_time}
                                        onChange={handleChange}
                                        onBlur={handleBlur} />

                                    <Heading size={'sm'}> To</Heading>
                                    <Input
                                        type={'datetime-local'}
                                        name={'to_date_time'}
                                        value={values.to_date_time}
                                        onChange={handleChange}
                                        onBlur={handleBlur} />
                                </VStack>
                            </form>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handleSubmit} colorScheme="yellow" mr={4}>Apply Override!</Button>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
                </>
            )}
                </Formik>
            </ModalContent>
        </Modal>
    );
};

export default ManualQueueOpenCloseModal;