import React, {useCallback, useEffect} from 'react';
import {Button, Flex, HStack, Icon, IconButton, Text, useColorMode} from "@chakra-ui/react";
import {useUserStore} from "@/stores/UserStore";
import {IoMoon, IoPerson} from "react-icons/io5";
import {useGoogleLogin} from "@react-oauth/google";
import {api_client} from "@/service_components/api";
import {loginWithGoogle, logout, setOnReconnect, subscribeToQueue, tokenLogin} from "@/service_components/SocketApi";
import useQueueStore from "@/stores/QueueStore";

const Navbar = (props) => {
    const uniqname = useUserStore(state => state.uniqname);
    const selectedQueueId = useQueueStore(state => state.selectedQueueId);

    const { colorMode, toggleColorMode} = useColorMode();

    const reconnectHandler = useCallback(() => {
        console.log('reconnect handler called')
        const creds = localStorage.getItem('credentials');

        if (creds) {
            const {token} = JSON.parse(creds);
            tokenLogin(token, () => {});
        }

        if (selectedQueueId) {
            subscribeToQueue(selectedQueueId);
        }
    }, [selectedQueueId]);

    useEffect(() => {
        reconnectHandler();
    }, []);



    useEffect(() => {
        const cleanup = setOnReconnect(reconnectHandler);

        return () => {
            cleanup();
        }
    }, [reconnectHandler]);

    return (
        <Flex justify={'space-between'} align={'center'} py={4} px={16} shadow={'base'} {...props}>
            <Flex justify={'flex-begin'}>
            </Flex>
            <Flex justify={'flex-end'}>
                <IconButton
                    aria-label={'color-mode'}
                    onClick={toggleColorMode}
                    icon={<Icon as={IoMoon} boxSize={4}/>}
                    variant={'ghost'}
                    cursor={'pointer'}
                    mr={4}/>
                {uniqname ? <LoggedInNavbarContents uniqname={uniqname}/> : <LoggedOutNavbarContents />}
            </Flex>
        </Flex>
    );
};

const LoggedOutNavbarContents = (props) => {
    const setLoginData = useUserStore(state => state.onLogin);
    const setLoggedOut = useUserStore(state => state.onLogout);

    const storeUserData = useCallback(({token, uniqname, is_staff: isStaff, error}) => {
        if (error) {
            setLoggedOut();
            return;
        }

        api_client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setLoginData({token, uniqname, isStaff});
        localStorage.setItem('credentials', JSON.stringify({token, uniqname, isStaff}));
    }, [setLoginData, setLoggedOut]);

    const onTokenLogin = useCallback((token) => {
        tokenLogin(token, storeUserData);
    }, [storeUserData]);

    const onGoogleLogin = async (data) => {
        const google_access_token = data.access_token;

        loginWithGoogle(google_access_token, ({token}) => {
            if (data.error) {
                console.error(data.error);
                return;
            }
            onTokenLogin(token);
        });
    }

    const onError = (error) => {
        console.error(error);
    };

    const googleLogin = useGoogleLogin({
        onSuccess: onGoogleLogin,
        onError: onError,
    });

    useEffect(() => {
        if (localStorage.getItem('credentials')) {
            const {token} = JSON.parse(localStorage.getItem('credentials'));
            if (token) {
                onTokenLogin(token);
            }
        }
    }, [onTokenLogin]);

    return (
        <Button
            colorScheme={'green'}
            onClick={() => googleLogin()}
        >Sign in</Button>
    );
}

const LoggedInNavbarContents = ({uniqname}) => {
    const clearLoginData = useUserStore(state => state.onLogout);

    const onLogout = () => {
        logout().then(() => {
            localStorage.removeItem('credentials');
            clearLoginData();
        });
    }
    return (
        <HStack>
            <Icon as={IoPerson} boxSize={4} mr={2}/>
            <Text fontWeight={'bold'}>{uniqname}</Text>
            <Button
                colorScheme={'gray'}
                ml={4}
                onClick={onLogout}
            >Sign out</Button>
        </HStack>
    );
}


export default Navbar;
