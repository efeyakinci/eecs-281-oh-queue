import React from 'react';
import moment from "moment/moment";
import {HStack, Icon, Text} from "@chakra-ui/react";
import {IoTime} from "react-icons/io5";

const OfficeHoursStatusDescriptor = (props) => {
    const nextOfficeHoursDate = "2024-02-05T23:00:00.000Z"
    const readableUntilOfficeHours = moment(nextOfficeHoursDate).fromNow();

    return (
        <HStack {...props}>
            <Icon as={IoTime} boxSize={4} /> <Text>Office hours queue opens {readableUntilOfficeHours}</Text>
        </HStack>
    );
};

export default OfficeHoursStatusDescriptor;
