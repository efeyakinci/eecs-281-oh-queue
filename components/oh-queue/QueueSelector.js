import React, {useEffect} from 'react';
import {Flex, Heading, Text, VStack} from "@chakra-ui/react";
import {MotionBox, MotionFlex, MotionIconButton, MotionVStack} from "@/components/motion-components/motion-components";
import {ArrowRightIcon} from "@chakra-ui/icons";

const QueueSelector = ({onToggle, isOpen, selectedQueueId, setSelectedQueueId, availableQueues, ...props}) => {
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

    useEffect(() => {
        if (selectedQueueId === undefined && Object.keys(availableQueues).length > 0) {
            setSelectedQueueId(Object.keys(availableQueues)[0])
        }
    }, [selectedQueueId, availableQueues]);

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
                    {Object.keys(availableQueues).map(((key,i) =>
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

    const selectedStyle=
    {
        boxShadow: boxShadow,
        bgColor: 'black',
        fontWeight: 'bold',
        color: 'white'
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
