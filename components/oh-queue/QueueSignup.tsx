import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    Icon,
    Input,
    NumberInput,
    NumberInputField,
    Textarea,
    Tooltip,
    VStack
} from "@chakra-ui/react";
import {Formik} from "formik";
import {IoPersonAdd} from "react-icons/io5";
import {MotionVStack} from "@/components/motion-components/motion-components";
import {joinQueue, updateSelf} from "@/service_components/SocketApi";
import OfficeHoursStatusDescriptor from "@/components/oh-queue/OfficeHoursStatusDescriptor";
import moment from "moment";
import useDelayedPeriodicUpdate from "@/hooks/useDelayedPeriodicUpdate";
import useQueueStore from "@/stores/QueueStore";
import {useUserStore} from "@/stores/UserStore";

const QueueSignup = (props: any) => {
    const queueStatus = useQueueStore(state => state.status);
    const selectedQueueId = useQueueStore(state => state.selectedQueueId);
    const isQueueOpen = useQueueStore(state => state.isQueueOpen);

    const [eventState, setEventState] = useState({});
    const [queueIsOpen, setQueueIsOpen] = useState(false);

    const queueStatusRef = useRef(queueStatus);

    const getRelevantEvents = useCallback(() => {
        if (!queueStatusRef.current || !queueStatusRef.current.events) {
            return;
        }

        const {events} = queueStatusRef.current;

        events.sort((a, b) => {
            return moment(a.start).diff(moment(b.start));
        });

        let currentEvent = events.findIndex(event => {
            return moment(event.start).subtract(2, 'seconds').isBefore(moment()) && moment(event.end).isAfter(moment());
        });

        if (currentEvent !== -1) {
            while (
                currentEvent < events.length - 1 &&
                moment(events[currentEvent + 1].start).subtract(2, 'seconds')
                    .isBefore(moment(events[currentEvent].end))
                ) {
                currentEvent++;
            }
        }

        const nextEvent = events.find(event => {
            return moment(event.start).isAfter(moment());
        });

        setQueueIsOpen(isQueueOpen(moment()));
        setEventState({currentEvent: events[currentEvent], nextEvent});
    }, [isQueueOpen, queueStatusRef]);

    const onJoinQueue = (values: any) => {
        if (!selectedQueueId) return;

        joinQueue(selectedQueueId, values);
    }

    const onUpdateSelf = (values: any) => {
        if (!selectedQueueId || !queueStatus.signedUpUid) return;

        updateSelf(selectedQueueId, queueStatus.signedUpUid, {help_description: values.help_description, location: values.location});
    }

    useDelayedPeriodicUpdate(getRelevantEvents, 60 * 1000);

    useEffect(() => {
        queueStatusRef.current = queueStatus;
        getRelevantEvents();
    }, [getRelevantEvents, queueStatus]);

    return (
        <MotionVStack {...props} align={'flex-start'}>
            <OfficeHoursStatusDescriptor
                w={'100%'}
                override={queueStatus.override}
                currentEvents={eventState}/>
            <Heading>Sign Up</Heading>
            <Formik 
            initialValues={{help_description: '', location: '', time_requested: 0}}
            onSubmit={queueStatus.userInQueue ? onUpdateSelf : onJoinQueue}>
                {({values, handleChange, handleBlur, handleSubmit, setFieldValue}) => (
                    <QueueSignupForm
                        values={values}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        handleSubmit={handleSubmit}
                        setFieldValue={setFieldValue}
                        queueIsOpen={queueIsOpen}
                        userInQueue={queueStatus.userInQueue}
                    />
                )}
            </Formik>
        </MotionVStack>
    );
};

type QueueSignupFormProps = {
    values: any;
    handleChange: any;
    handleBlur: any;
    handleSubmit: any;
    queueIsOpen: boolean;
    userInQueue: boolean;
    setFieldValue: any;
}

const QueueSignupForm: React.FC<QueueSignupFormProps> = ({values, handleChange, handleBlur, handleSubmit, queueIsOpen, userInQueue, setFieldValue}) => {
    const userLoggedIn = useUserStore(state => state.isLoggedIn);

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
                <NumberInput min={0} isDisabled={userInQueue} onChange={(num) => setFieldValue("time_requested", parseInt(num))} onBlur={handleBlur}>
                    <NumberInputField placeholder={'5'}/>
                </NumberInput>
                <FormHelperText>(in minutes)</FormHelperText>
                <FormHelperText>This is so that other students have an idea of how long they might need to wait for.</FormHelperText>
            </FormControl>

            <Tooltip
                isDisabled={userLoggedIn}
                label={'You must be logged in to join the queue'}
                placement={'bottom'}>
            <Button
                leftIcon={<Icon as={IoPersonAdd} />}
                type={'submit'}
                colorScheme={'green'}
                isDisabled={!values.help_description
                    || !values.location
                    || (!queueIsOpen && !userInQueue)
                    || (!values.time_requested && !userInQueue)
                    || !userLoggedIn
            }>
                {userInQueue ? "Update" : "Sign Up"}
            </Button>
            </Tooltip>
        </VStack>
    );
}

export default QueueSignup;
