import React from 'react';
import moment from "moment/moment";
import {HStack, Icon, Text} from "@chakra-ui/react";
import {IoTime} from "react-icons/io5";

const OfficeHoursStatusDescriptor = ({queueStatus, ...props}) => {
    console.log(queueStatus);
    const currentOfficeHoursDate = queueStatus?.current_event?.start?.dateTime;
    const nextOfficeHoursDate = queueStatus?.next_event?.start?.dateTime;

    const getOfficeHoursText = () => {
        if (currentOfficeHoursDate) {
            const readablUntilOfficeHoursEnd = moment(currentOfficeHoursDate).fromNow();
            return "Queue is open until " + readablUntilOfficeHoursEnd;
        } else if (nextOfficeHoursDate) {
            const readableUntilOfficeHours = moment(nextOfficeHoursDate).fromNow();
            return "Queue opens " + readableUntilOfficeHours;
        } else {
            return "No office hours scheduled today";
        }
    }

    return (
        <HStack {...props}>
            <Icon as={IoTime} boxSize={4} /> <Text>{getOfficeHoursText()}</Text>
        </HStack>
    );
};

export default OfficeHoursStatusDescriptor;
