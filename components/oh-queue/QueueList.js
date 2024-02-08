import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {Divider, Heading, HStack, Icon, Text, useToast, VStack} from "@chakra-ui/react";
import {IoSchool} from "react-icons/io5";
import {
    leaveQueue,
    requestItemInfo,
    requestQueueUpdate,
    setItemInfoHandler, setQueueDataUpdateHandler,
    setQueueUpdateHandler
} from "@/service_components/SocketApi";
import QueueContext from "@/components/oh-queue/QueueContext";
import {useUserStore} from "@/stores/UserStore";
import QueueListDisplay from "@/components/oh-queue/QueueListDisplay";
import {errorToast} from "@/components/oh-queue/Toasts";

const QueueList = ({...props}) => {
    const [queueWaiters, setQueueWaiters] = useState([]);
    const {selectedQueue} = useContext(QueueContext);
    const loggedInUser = useUserStore(state => state.uniqname);
    const toast = useToast();

    const [waiterInfos, setWaiterInfos] = useState({});
    const [waiterIndices, setWaiterIndices] = useState({});

    const queueInfoUpdateHandler = (data) => {
        if (data.error) {
            toast(errorToast(data.error));
        }

        setWaiterInfos((prevInfos) => {
            return {...prevInfos, ...data.item_infos};
        });
    };

    useEffect(() => {
        if (!selectedQueue.id) return;

        setWaiterInfos({});
        setWaiterIndices({});
        requestQueueUpdate(selectedQueue.id);
    }, [selectedQueue, loggedInUser, toast]);

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
        if (unknownItems.length > 0) {
            requestItemInfo(selectedQueue.id, unknownItems, queueInfoUpdateHandler);
        }
    }, [selectedQueue, waiterIndices, waiterInfos, queueInfoUpdateHandler]);

    useEffect(() => {
        if (!selectedQueue.id) return;

        const queueUpdateHandler = (data) => {
            console.log("Received queue update", data)
            if (data.error) {
                toast(errorToast(data.error));
            }

            setWaiterIndices(data.updated_queue);
            const removableUids = new Set(data.removable_uids);
            console.log("Removing uids", removableUids)
            setWaiterInfos((prevInfos) => {
                const newInfos = Object.fromEntries(
                    Object.entries(prevInfos)
                        .filter(([uid, _]) => !removableUids.has(uid))
                );

                return {...newInfos};
            })
        }

        const updateHandlerCleanup = setQueueUpdateHandler(queueUpdateHandler);

        const dataUpdateHandlerCleanup = setQueueDataUpdateHandler(({updated_uids}) => {
            console.log("Requesting item info for", updated_uids)
            requestItemInfo(selectedQueue.id, updated_uids, queueInfoUpdateHandler);
        })

        return () => {
            updateHandlerCleanup();
            dataUpdateHandlerCleanup();
        }
    }, [selectedQueue, queueInfoUpdateHandler, toast])

    return (
        <VStack {...props} align={'flex-start'} h={'100%'}>
            <Heading>{
                selectedQueue.selectedQueueName ? selectedQueue.selectedQueueName : "Select a queue to get started!"
            }</Heading>
            <HStack w={'100%'}>
                <Icon as={IoSchool} /> <Text>{queueWaiters.length} students waiting</Text>
            </HStack>
            <Divider />
            <VStack w={'100%'} spacing={8} mt={4}>
                    <QueueListDisplay
                        waiters={queueWaiters}
                    />
            </VStack>
        </VStack>
    );
};

export default QueueList;
