import React, {useContext, useEffect, useRef, useState} from 'react';
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
import QueueScheduleContext from "@/components/contexts/QueueScheduleContext";
import OfficeHoursStatusDescriptor from "@/components/oh-queue/OfficeHoursStatusDescriptor";
import QueueStatusContext from "@/components/contexts/QueueStatusContext";
import moment from "moment";
import useDelayedPeriodicUpdate from "@/hooks/useDelayedPeriodicUpdate";
import useQueueStore from "@/stores/QueueStore";

const QueueSignup = (props) => {
    const queueStatus = useQueueStore(state => state.status);
    const selectedQueueId = useQueueStore(state => state.selectedQueueId);

    const [eventState, setEventState] = useState({});

    const queueStatusRef = useRef(queueStatus);


    const getRelevantEvents = () => {
        if (!queueStatusRef.current || !queueStatusRef.current.events) {
            return;
        }

        const {events} = queueStatusRef.current;

        const currentEvent = events.find(event => {
            return moment(event.start).subtract(2, 'seconds').isBefore(moment()) && moment(event.end).isAfter(moment());
        });

        const nextEvent = events.find(event => {
            return moment(event.start).isAfter(moment());
        });

        setEventState({currentEvent, nextEvent});
    }

    const onFormSubmit = (values) => {
        joinQueue(selectedQueueId, values);
    }

    useDelayedPeriodicUpdate(getRelevantEvents, 60 * 1000);

    useEffect(() => {
        queueStatusRef.current = queueStatus;
        getRelevantEvents();
    }, [queueStatus]);

    return (
        <MotionVStack {...props} align={'flex-start'}>
            <OfficeHoursStatusDescriptor
                w={'100%'}
                currentEvents={eventState}/>
            <Heading>Sign Up</Heading>
            <Formik initialValues={{help_description: '', location: '', time_requested: 0}} onSubmit={onFormSubmit}>
                {({values, handleChange, handleBlur, handleSubmit}) => (
                    <QueueSignupForm
                        values={values}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        handleSubmit={handleSubmit}
                        queueIsOpen={eventState.currentEvent !== undefined}
                        userInQueue={queueStatus.userInQueue}
                    />
                )}
            </Formik>
        </MotionVStack>
    );
};

const QueueSignupForm = ({values, handleChange, handleBlur, handleSubmit, queueIsOpen, userInQueue}) => {
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
                <FormHelperText>For virtual office hours, put your meeting link.</FormHelperText>
                <FormHelperText>For in-person office hours, put where you are and what you&apos;re wearing.</FormHelperText>
            </FormControl>

            <FormControl>
                <FormLabel>How Long Do You Think It&apos;ll Take?</FormLabel>
                <NumberInput min={0}>
                    <NumberInputField placeholder={5} name={"time_requested"} onChange={handleChange} onBlur={handleBlur}/>
                </NumberInput>
                <FormHelperText>This is so that other students have an idea of how long they might need to wait for.</FormHelperText>
            </FormControl>

            <Button
                leftIcon={<Icon as={IoPersonAdd} />}
                type={'submit'}
                colorScheme={'green'}
                isDisabled={!values.help_description || !values.location || !queueIsOpen}>
                {userInQueue ? "Update" : "Sign Up"}
            </Button>
        </VStack>
    );
}

export default QueueSignup;
