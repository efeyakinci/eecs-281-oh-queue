import React, {useCallback, useEffect, useState} from 'react';
import {Divider, Heading, HStack, Icon, Image, Text, useColorModeValue, useToast, VStack} from "@chakra-ui/react";
import {IoSchool} from "react-icons/io5";
import {
    requestItemInfo,
    requestQueueUpdate, setOnReconnect,
    setQueueDataUpdateHandler,
    setQueueUpdateHandler
} from "@/service_components/SocketApi";
import {useUserStore} from "@/stores/UserStore";
import QueueListDisplay from "@/components/oh-queue/QueueListDisplay";
import {errorToast} from "@/components/oh-queue/Toasts";
import useQueueStore from "@/stores/QueueStore";
import {AnimatePresence, LayoutGroup} from "framer-motion";
import {MotionBox} from "@/components/motion-components/motion-components";
import Head from "next/head";
import {useErrorToast} from "@/hooks/useErrorToast";
import {QueueWaiter} from "@/types/QueueTypes";

const QueueList = ({...props}) => {
    const [queueWaiters, setQueueWaiters] = useState<QueueWaiter[]>([]);

    const selectedQueueId = useQueueStore(state => state.selectedQueueId);
    const selectedQueueName = useQueueStore(state => state.selectedQueueName);
    const selectedQueueClass = useQueueStore(state => state.selectedQueueClass);

    const setQueueStatus = useQueueStore(state => state.setStatus);
    const loggedInUser = useUserStore(state => state.uniqname);
    const errorToast = useErrorToast();

    const [waiterInfos, setWaiterInfos] = useState<{[k: string]: QueueWaiter}>({});
    const [waiterIndices, setWaiterIndices] = useState<{[k: string]: number}>({});

    const queueInfoUpdateHandler = useCallback((data: any) => {
        if (data.error) {
            errorToast(data.error);
        }

        setWaiterInfos((prevInfos) => {
            return {...prevInfos, ...data.item_infos};
        });
    }, [errorToast]);

    useEffect(() => {
        if (!selectedQueueId) return;

        setWaiterInfos({});
        setWaiterIndices({});
        requestQueueUpdate(selectedQueueId);
    }, [selectedQueueId, loggedInUser, errorToast]);

    useEffect(() => {
        const newWaiters = Object.keys(waiterIndices)
            .filter((uid) => waiterInfos[uid])
            .map((uid) => {
                return {
                    ...waiterInfos[uid],
                    uid,
                };
            });

        newWaiters.sort((a, b) => {
            return waiterIndices[a.uid] - waiterIndices[b.uid];
        });

        setQueueWaiters(newWaiters);

    }, [waiterIndices, waiterInfos])

    useEffect(() => {
        const unknownItems = Object.keys(waiterIndices).filter((uid) => !waiterInfos[uid]);
        if (unknownItems.length > 0 && selectedQueueId) {
            requestItemInfo(selectedQueueId, unknownItems, queueInfoUpdateHandler);
        }
    }, [selectedQueueId, waiterIndices, waiterInfos, queueInfoUpdateHandler]);

    useEffect(() => {
        const cleanup = setOnReconnect(() => {
            if (!selectedQueueId) return;

            setWaiterInfos({});
            setWaiterIndices({});
            requestQueueUpdate(selectedQueueId);
        })

        return () => {
            cleanup();
        }
    }, [selectedQueueId, setWaiterInfos, setWaiterIndices]);

    useEffect(() => {
        if (!selectedQueueId) return;

        const queueUpdateHandler = (data: any) => {
            if (data.error) {
                errorToast(data.error);
            }

            setWaiterIndices(data.updated_queue);
            const removableUids = new Set(data.removable_uids);
            setWaiterInfos((prevInfos) => {
                const newInfos = Object.fromEntries(
                    Object.entries(prevInfos)
                        .filter(([uid, _]) => !removableUids.has(uid))
                );

                return {...newInfos};
            });

            if (data.queue_status) {
                setQueueStatus((status) => ({...status, ...data.queue_status, override: data.queue_status.override}));
            }
        }

        const updateHandlerCleanup = setQueueUpdateHandler(queueUpdateHandler);

        const dataUpdateHandlerCleanup = setQueueDataUpdateHandler(({updated_uids}) => {
            console.log("Requesting item info for", updated_uids)
            requestItemInfo(selectedQueueId, updated_uids, queueInfoUpdateHandler);
        })

        return () => {
            updateHandlerCleanup();
            dataUpdateHandlerCleanup();
        }
    }, [selectedQueueId,setQueueStatus, queueInfoUpdateHandler, errorToast])

    return (
        <VStack {...props} align={'flex-start'} h={'100%'}>
            <Head>
                <title>{queueWaiters.length ? "(" + queueWaiters.length + ")" : ""} EECS Office Hours Queue</title>
            </Head>
            <Heading size={'md'}>{selectedQueueClass}</Heading>
            <Heading>{
                selectedQueueName ? selectedQueueName : "Select a queue to get started!"
            }</Heading>
            <HStack w={'100%'}>
                <Icon as={IoSchool} /> <Text>{queueWaiters.length} students waiting</Text>
            </HStack>
            <Divider />
            <VStack w={'100%'} spacing={8} mt={4}>
                <AnimatePresence>
                <LayoutGroup>
                    <QueueListDisplay
                        waiters={queueWaiters}
                    />

                {queueWaiters.length === 0 &&
                    <EmptyQueueDisplay />
                }
                </LayoutGroup>
                </AnimatePresence>
            </VStack>
        </VStack>
    );
};

function EmptyQueueDisplay() {
    const grayTextColor = useColorModeValue('gray.500', 'gray.400')

    return (
            <MotionBox
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
            >
                <VStack w={'100%'} align={'center'} spacing={4}>
                    <Heading size={'sm'} fontWeight={'bold'} color={grayTextColor}>It&apos;s a little lonely in here...</Heading>
                    <Image
                        alt={'Empty queue'}
                        borderRadius={32}
                        w={64}
                        boxShadow={'lg'}
                        src={'/empty_queue_image.webp'}/>
                </VStack>
            </MotionBox>
    )
}

export default QueueList;
