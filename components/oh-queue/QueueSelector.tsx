import React, {useEffect} from 'react';
import {Collapse, Flex, Heading, HStack, Text, useColorMode, VStack} from "@chakra-ui/react";
import {MotionBox, MotionFlex, MotionIconButton, MotionVStack} from "@/components/motion-components/motion-components";
import {ArrowDownIcon, ArrowRightIcon} from "@chakra-ui/icons";
import {useRouter} from "next/router";
import { AvailableQueue } from '@/types/QueueTypes';
import {LayoutGroup} from "framer-motion";

const toggleButtonVariants = {
    "closed": {
        rotate: 0
    },
    "open": {
        rotate: 180
    }
};

const toggleContentVariants = {
    "closed": {
        opacity: 0
    },
    "open": {
        opacity: 1
    }
};

type QueueSelectorProps = {
    onToggle: () => void,
    isOpen: boolean,
    selectedQueueId: string | undefined,
    setSelectedQueueId: (queueId: string) => void,
    availableQueues: {[key: string]: AvailableQueue},
    [key: string]: any
}

const QueueSelector: React.FC<QueueSelectorProps> = ({onToggle, isOpen, selectedQueueId, setSelectedQueueId, availableQueues, ...props}) => {
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        if (selectedQueueId === undefined && Object.keys(availableQueues).length > 0) {
            const availableQueueIds = Object.keys(availableQueues);
            if (router.query?.queueId && availableQueueIds.includes(router.query.queueId as string)) {
                setSelectedQueueId(router.query.queueId as string);
            } else {
                setSelectedQueueId(availableQueueIds[0])
            }
        }
    }, [selectedQueueId, availableQueues, setSelectedQueueId, router.isReady, router.query?.queueId]);

    const getClassQueues = (queues: {[key: string]: AvailableQueue}): {[key: string]: {[key: string]: AvailableQueue}} => {
        const classQueues: {[key: string]: {[key: string]: AvailableQueue}} = {};

        Object.entries(queues).forEach(([queue_id, queue]) => {
            if (!classQueues[queue.class_name]) {
                classQueues[queue.class_name] = {};
            }

            classQueues[queue.class_name][queue_id] = queue;
        });

        return classQueues;
    }

    return (
        <MotionVStack align={'flex-start'} borderRightWidth={'1px'} {...props}>
            <Flex w={'100%'} justify={'flex-end'}>
                <MotionBox
                    variants={toggleButtonVariants}
                    initial={"closed"}
                    animate={isOpen ? "open" : "closed"}
                    mr={8}>
                <MotionIconButton
                    onClick={onToggle}
                    cursor={'pointer'}
                    aria-label={'Open Queue Selection Menu'}
                    as={ArrowRightIcon}
                    boxSize={4}
                    variant={'ghost'} />
                </MotionBox>
            </Flex>

            <MotionVStack
                w={'100%'}
                variants={toggleContentVariants}
                initial={"closed"}
                animate={isOpen ? "open" : "closed"}
                align={'flex-start'}
                mt={4}
            >
                <Heading px={4} size={'md'}>Office Hours Queues</Heading>

                <VStack w={'100%'} px={4} mt={4}>
                    <LayoutGroup>

                    <VStack w={'100%'} px={2} pb={2} spacing={2} borderLeftWidth={'1px'}>
                    {
                        Object.entries(getClassQueues(availableQueues)).map(([class_name, queues]) =>
                            <ClassQueues
                                key={class_name}
                                className={class_name}
                                queues={queues}
                                selectedQueueId={selectedQueueId}
                                setSelectedQueueId={setSelectedQueueId}
                            />
                        )
                    }
                    </VStack>
                    </LayoutGroup>
                </VStack>
            </MotionVStack>
        </MotionVStack>
    );
};

type ClassQueuesProps = {
    className: string,
    queues: {[key: string]: AvailableQueue},
    selectedQueueId: string | undefined,
    setSelectedQueueId: (queueId: string) => void
}

const ClassQueues = ({className, queues, selectedQueueId, setSelectedQueueId}: ClassQueuesProps) => {
    const [isCollapsed, setIsCollapsed] = React.useState(true);

    useEffect(() => {
        if (Object.keys(queues).some(queue_id => queue_id === selectedQueueId)) {
            setIsCollapsed(false);
        }
    }, [queues, selectedQueueId]);

    return (
        <VStack w={'100%'} px={4} pb={2} spacing={2} align={'start'}>
            <HStack
                w={'100%'}
                justify={'space-between'}
                cursor={'pointer'}
                mb={2}
                onClick={() => setIsCollapsed(prevState => !prevState)}>
                <Heading size={'sm'}>{className}</Heading>
                <ArrowDownIcon boxSize={4} />
            </HStack>
            <Collapse in={!isCollapsed}>
                {Object.entries(queues).map(([queue_id, queue]) =>
                    <SelectableQueue
                        key={queue_id}
                        queueName={queue.queue_name}
                        selected={queue_id === selectedQueueId}
                        onClick={() => setSelectedQueueId(queue_id)}
                    />
                )}
            </Collapse>
        </VStack>
    );
}

type SelectableQueueProps = {
    queueName: string,
    selected: boolean,
    [key: string]: any
}

const SelectableQueue = ({queueName, selected, ...props}: SelectableQueueProps) => {
    const boxShadow = "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px"
    const { colorMode } = useColorMode();

    const selectedStyle=
    {
        boxShadow: boxShadow,
        bgColor: colorMode === "light" ? 'black' : "white",
        fontWeight: 'bold',
        color: colorMode === "light" ? 'white' : 'black'
    }

    return (
        <MotionFlex
            justify={'flex-start'}
            w={'100%'}
            p={2}
            layout={'position'}
            borderRadius={8}
            cursor={'pointer'}
            _hover={{boxShadow: "md",
                transitionDuration: '0.2s',
                transitionTimingFunction: "ease-in-out"}}
            {...(selected ? selectedStyle : {boxShadow: "none"})}
            {...props}>
            <Text px={2}>{queueName}</Text>
        </MotionFlex>
    );
};

export default QueueSelector;
