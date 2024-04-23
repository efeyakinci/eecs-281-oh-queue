import {
    Button, Flex,
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
    Text, useColorModeValue,
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
                <Formik initialValues={{
                    override_type: "open",
                    from_date_time: moment().format("YYYY-MM-DDTHH:mm"),
                    to_date_time: moment().add(30, 'minutes').format("YYYY-MM-DDTHH:mm")
                }}
                        onSubmit={onOverrideQueue}>
                    {({values, handleChange, handleBlur, handleSubmit}) => (
                        <>
                            <ModalHeader>Manually Open/Close Queue</ModalHeader>
                            <ModalCloseButton/>
                            <ModalBody>
                                <Text> If you would like to manually open or close the queue during a certain time, this
                                    is the
                                    place to be!</Text>
                                <form onSubmit={handleSubmit}>
                                    <VStack mt={4} align={'flex-start'} spacing={4}>
                                        <Heading size={'md'}> Open or Close the Queue?</Heading>
                                        <Flex flexDir={'row'} w={'100%'} justify={'space-between'}>
                                            <SelectionButton
                                                value={'open'}
                                                selectedValue={values.override_type}
                                                borderRadius={8}
                                                onClick={() => handleChange({target: {name: 'override_type', value: 'open'}})}
                                                flex={8}>
                                                <Text fontWeight={'bold'}>Open</Text>
                                            </SelectionButton>
                                            <Flex flex={1}/>
                                            <SelectionButton
                                                value={'close'}
                                                selectedValue={values.override_type}
                                                borderRadius={8}
                                                onClick={() => handleChange({target: {name: 'override_type', value: 'close'}})}
                                                flex={8}>
                                                <Text fontWeight={'bold'}>Close</Text>
                                            </SelectionButton>
                                        </Flex>
                                        <Heading size={'sm'}> From</Heading>
                                        <Input
                                            type={'datetime-local'}
                                            name={'from_date_time'}
                                            value={values.from_date_time}
                                            onChange={handleChange}
                                            onBlur={handleBlur}/>

                                        <Heading size={'sm'}> To</Heading>
                                        <Input
                                            type={'datetime-local'}
                                            name={'to_date_time'}
                                            value={values.to_date_time}
                                            onChange={handleChange}
                                            onBlur={handleBlur}/>
                                    </VStack>
                                </form>
                            </ModalBody>
                            <ModalFooter>
                                <Button onClick={handleSubmit} colorScheme="orange" mr={4}>Apply Override!</Button>
                                <Button onClick={onClose}>Close</Button>
                            </ModalFooter>
                        </>
                    )}
                </Formik>
            </ModalContent>
        </Modal>
    );
};

const SelectionButton = ({value, selectedValue, onClick, children, ...props}) => {
    const selectedColor = useColorModeValue('orange.200', 'orange.400')
    const notSelectedColor = useColorModeValue('white', 'blue.900')
    const borderColor = useColorModeValue('gray.200', 'gray.600')

    return (
        <Flex justify={'center'}
              cursor={'pointer'}
              p={4}
              borderWidth={1}
              borderColor={selectedValue === value ? selectedColor : borderColor}
              borderRadius={8}
              bg={selectedValue === value ? selectedColor : 'none'}
              transition={'all 0.1s ease-in-out'}
              onClick={onClick}
            {...props}>
            {children}
        </Flex>
    );
}

export default ManualQueueOpenCloseModal;