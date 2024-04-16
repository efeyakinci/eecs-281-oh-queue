import {useToast} from "@chakra-ui/react";
import {useCallback} from "react";

export const useErrorToast = () => {
    const toast = useToast();
    return useCallback((message: string) => {
        toast({
            title: "Error",
            description: message,
            status: "error",
            duration: 9000,
            isClosable: true,
        });
    }, [toast]);
}