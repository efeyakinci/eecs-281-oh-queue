import React, {useEffect, useRef, useState} from 'react';
import moment from "moment/moment";
import {HStack, Icon, Text} from "@chakra-ui/react";
import {IoTime} from "react-icons/io5";

const OfficeHoursStatusDescriptor = ({currentEvents, ...props}) => {

    const getOfficeHoursText = () => {
        const {currentEvent, nextEvent} = currentEvents;
        if (currentEvent) {
            const readablUntilOfficeHoursEnd = moment(currentEvent.end).fromNow();
            return "Queue closes " + readablUntilOfficeHoursEnd;
        } else if (nextEvent) {
            const readableUntilOfficeHours = moment(nextEvent.start).fromNow();
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
