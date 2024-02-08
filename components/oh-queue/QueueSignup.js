import React, {useContext} from 'react';
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    Icon,
    Input,
    NumberInput, NumberInputField,
    Textarea,
    VStack
} from "@chakra-ui/react";
import {Formik} from "formik";
import {IoPersonAdd} from "react-icons/io5";
import {MotionVStack} from "@/components/motion-components/motion-components";
import {joinQueue} from "@/service_components/SocketApi";
import QueueContext from "@/components/oh-queue/QueueContext";
import OfficeHoursStatusDescriptor from "@/components/oh-queue/OfficeHoursStatusDescriptor";

const QueueSignup = (props) => {
    const { selectedQueue } = useContext(QueueContext);

    const onFormSubmit = (values) => {
        joinQueue(selectedQueue.id, values);
    }

    return (
        <MotionVStack {...props} align={'flex-start'}>
            <OfficeHoursStatusDescriptor w={'100%'}/>
            <Heading>Sign Up</Heading>
            <Formik initialValues={{help_description: '', location: '', time_requested: 0}} onSubmit={onFormSubmit}>
                {({values, handleChange, handleBlur, handleSubmit}) => (
                    <QueueSignupForm
                        values={values}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        handleSubmit={handleSubmit}
                    />
                )}
            </Formik>
        </MotionVStack>
    );
};

const QueueSignupForm = ({values, handleChange, handleBlur, handleSubmit}) => {
    return (
        <VStack as={'form'} w={'100%'} spacing={4} align={'flex-start'} onSubmit={handleSubmit}>
            <FormControl>
                <FormLabel>Help Description</FormLabel>
                <Textarea
                    name={'help_description'}
                    value={values.help_description}
                    placeholder={'What do you need help with?'}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </FormControl>
            <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                    name={'location'}
                    value={values.location}
                    onChange={handleChange}
                    placeholder={'e.g. BBB couches wearing a blue shirt'}
                    onBlur={handleBlur}
                />
            </FormControl>

            <FormControl>
                <FormLabel>How Much Time Will You Need?</FormLabel>
                <NumberInput min={0}>
                    <NumberInputField placeholder={5} name={"time_requested"} onChange={handleChange} onBlur={handleBlur}/>
                </NumberInput>
                <FormHelperText>In minutes, please.</FormHelperText>
            </FormControl>

            <Button
                leftIcon={<Icon as={IoPersonAdd} />}
                type={'submit'}
                colorScheme={'green'}
                isDisabled={!values.help_description || !values.location}
            >Sign Up</Button>
        </VStack>
    );
}

export default QueueSignup;
