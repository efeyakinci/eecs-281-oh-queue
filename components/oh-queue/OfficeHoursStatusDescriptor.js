import React, {useEffect, useRef, useState} from 'react';
import moment from "moment/moment";
import {HStack, Icon, Text} from "@chakra-ui/react";
import {IoTime} from "react-icons/io5";

const OfficeHoursStatusDescriptor = ({currentEvents, ...props}) => {

    const getOfficeHoursText = () => {
        const {currentEvent, nextEvent} = currentEvents;
        if (currentEvent) {
            const readableUntilOfficeHoursEnd = moment(currentEvent.end).fromNow();
            return "Queue closes " + readableUntilOfficeHoursEnd + " (at " + moment(currentEvent.end).format('h:mm a') + ")";
        } else if (nextEvent) {
            const readableUntilOfficeHours = moment(nextEvent.start).fromNow() + " (at " + moment(nextEvent.start).format('h:mm a') + ")";
            return "Queue opens " + readableUntilOfficeHours;
        } else {
            return "No office hours scheduled soon";
        }
    }

    return (
        <HStack {...props}>
            <Icon as={IoTime} boxSize={4} /> <Text>{getOfficeHoursText()}</Text>
        </HStack>
    );
};

export default OfficeHoursStatusDescriptor;
