import React, {useEffect} from 'react';
import {Button, Flex, HStack, Icon, Input, Spacer, Text} from "@chakra-ui/react";
import {useUserStore} from "@/stores/UserStore";
import {IoPerson} from "react-icons/io5";
import {GoogleLogin, useGoogleLogin} from "@react-oauth/google";
import api, {api_client} from "@/service_components/api";
import {loginWithGoogle, logout, tokenLogin} from "@/service_components/SocketApi";

const Navbar = (props) => {
    const uniqname = useUserStore(state => state.uniqname);

    return (
        <Flex justify={'space-between'} align={'center'} py={4} px={16} shadow={'base'} {...props}>
            <Flex justify={'flex-begin'}>
            </Flex>
            <Flex justify={'flex-end'}>
                {uniqname ? <LoggedInNavbarContents uniqname={uniqname}/> : <LoggedOutNavbarContents />}
            </Flex>
        </Flex>
    );
};

const LoggedOutNavbarContents = (props) => {
    const setUserStoreState = useUserStore(state => state.onLogin);

    const storeUserData = ({token, uniqname, is_staff: isStaff}) => {
        api_client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUserStoreState({token, uniqname, isStaff});
        localStorage.setItem('credentials', JSON.stringify({token, uniqname, isStaff}));
    }

    const onTokenLogin = (token) => {
        tokenLogin(token, storeUserData);
    }

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
            const {token, uniqname, isStaff} = JSON.parse(localStorage.getItem('credentials'));
            onTokenLogin(token);
        }
    }, []);

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
