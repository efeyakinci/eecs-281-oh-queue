import React from 'react';
import moment from "moment/moment";
import {HStack, Icon, Text, useColorModeValue, VStack} from "@chakra-ui/react";
import {IoTime, IoWarning} from "react-icons/io5";

const OfficeHoursStatusDescriptor = ({currentEvents, override, ...props}) => {
    const colorModeGreen = useColorModeValue('green.500', 'green.300');
    const colorModeRed = useColorModeValue('red.500', 'red.300');

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

    const getOverrideText = () => {
        if (!override) {
            return undefined;
        }

        const overrideStart = moment.unix(override.from_date_time);
        const overrideEnd = moment.unix(override.to_date_time);

        if (!moment().isBetween(overrideStart, overrideEnd)) {
            return undefined;
        }

        if (override.type === "open") {
            return <Text fontWeight={'bold'} color={colorModeGreen}>Queue is manually open until {overrideEnd.format('h:mm a')}</Text>
        } else {
            return <Text fontWeight={'bold'} color={colorModeRed}>Queue is manually closed until {overrideEnd.format('h:mm a')}</Text>
        }
    }

    const overrideText = getOverrideText();

    return (
        <VStack {...props} align={'flex-start'}>
            {overrideText && <HStack><Icon as={IoWarning} boxSize={4} /> {overrideText}</HStack>}
            <HStack><Icon as={IoTime} boxSize={4} /> <Text>{getOfficeHoursText()}</Text></HStack>
        </VStack>
    );
};

export default OfficeHoursStatusDescriptor;
