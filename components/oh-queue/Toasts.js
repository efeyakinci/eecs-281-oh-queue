export const errorToast = (message) => {
    return {
        title: "Something went wrong!",
        description: message,
        status: "error",
        duration: 10000,
        isClosable: true,
    };
}