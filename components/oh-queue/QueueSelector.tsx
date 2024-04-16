import React, {useEffect} from 'react';
import {Flex, Heading, Text, useColorMode, VStack} from "@chakra-ui/react";
import {MotionBox, MotionFlex, MotionIconButton, MotionVStack} from "@/components/motion-components/motion-components";
import {ArrowRightIcon} from "@chakra-ui/icons";
import {useRouter} from "next/router";

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

const QueueSelector = ({onToggle, isOpen, selectedQueueId, setSelectedQueueId, availableQueues, ...props}) => {
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        if (selectedQueueId === undefined && Object.keys(availableQueues).length > 0) {
            const availableQueueIds = Object.keys(availableQueues);
            if (router.query?.queueId && availableQueueIds.includes(router.query.queueId)) {
                setSelectedQueueId(router.query.queueId);
            } else {
                setSelectedQueueId(availableQueueIds[0])
            }
        }
    }, [selectedQueueId, availableQueues, setSelectedQueueId, router.isReady, router.query?.queueId]);

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
                    <VStack w={'100%'} px={2} pb={2} spacing={2} borderLeftWidth={'1px'}>
                    {Object.keys(availableQueues).map(((key) =>
                        <SelectableQueue
                            key={key}
                            queueName={availableQueues[key]}
                            selected={key === selectedQueueId}
                            onClick={() => setSelectedQueueId(key)}
                        />
                    ))}
                    </VStack>
                </VStack>
            </MotionVStack>
        </MotionVStack>
    );
};

const SelectableQueue = ({queueName, selected, ...props}) => {
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
