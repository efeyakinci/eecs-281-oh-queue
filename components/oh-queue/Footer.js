import React from 'react';
import {Text, VStack} from "@chakra-ui/react";

const Footer = () => {
    return (
        <VStack w={'100%'} borderTopWidth={'1px'} spacing={4} p={8}>
            <Text color={'gray'}>Made with ❤️ by Efe Akinci</Text>
        </VStack>
    );
};

export default Footer;
