import React, {useEffect, useMemo} from 'react';
import {CloseButton, Flex, Heading, useColorMode, VStack} from "@chakra-ui/react";
import useQueueStore from "@/stores/QueueStore";
import {Announcement} from "@/types/QueueTypes";
import { removeAnnouncement } from "@/service_components/SocketApi";
import {useUserStore} from "@/stores/UserStore";


const QueueAnnouncements = (props: any) => {
    const announcements = useQueueStore(state => state.status.announcements);

    const filteredAnnouncements = useMemo(() => announcements.filter(announcement => {
        return !announcement.until || announcement.until > Date.now();
    }), [announcements]);

    const announcementsList = useMemo(() => filteredAnnouncements.map((announcement, index) => {
        return <QueueAnnouncement key={index} announcement={announcement}/>
    }), [filteredAnnouncements]);

    if (announcementsList.length === 0) {
        return null;
    }

    return (
        <VStack spacing={4} w={'100%'} align={'flex-start'} {...props}>
            <Heading mb={2}>Announcements</Heading>
            <VStack spacing={2} w={'100%'} align={'flex-start'}>
                {announcementsList}
            </VStack>
        </VStack>
    );
};

type QueueAnnouncementProps = {
    announcement: Announcement;
}

const QueueAnnouncement: React.FC<QueueAnnouncementProps> = ({announcement}) => {
    const { colorMode } = useColorMode();
    const queueId = useQueueStore(state => state.selectedQueueId);
    const isStaff = useUserStore(state => state.isStaff);

    const deleteAnnouncement = () => {
        if (!queueId) return;

        removeAnnouncement(queueId, announcement.id);
    }

    return (
        <VStack position={'relative'}
                bg={colorMode === "light" ? 'yellow.200' : 'yellow.400'}
                w={'100%'}
                p={4}
                spacing={0}
                borderRadius={4}
                color={'black'}
                align={'flex-start'}>
            {isStaff && <CloseButton position={'absolute'} right={1} top={1} onClick={deleteAnnouncement}/>}
            <Flex pr={4}
                  wordBreak={'break-word'}>
                {announcement.message}
            </Flex>
        </VStack>
    );
}

export default QueueAnnouncements;
