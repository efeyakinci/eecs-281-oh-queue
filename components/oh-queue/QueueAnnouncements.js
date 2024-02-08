import React from 'react';
import {Box, Heading, VStack, Text, Flex, CloseButton} from "@chakra-ui/react";

const QueueAnnouncements = (props) => {

    return (
        <VStack spacing={4} w={'100%'} align={'flex-start'} {...props}>
            <Heading mb={2}>Announcements</Heading>

            <QueueAnnouncement announcement={"The queue is currently closed."}/>
        </VStack>
    );
};

const QueueAnnouncement = ({announcement}) => {
    return (
        <VStack bg={'yellow.200'} w={'100%'} p={4} pt={4} spacing={0} borderRadius={4} align={'flex-start'}>
            <Flex>
                {announcement}
            </Flex>
        </VStack>
    );
}

export default QueueAnnouncements;
