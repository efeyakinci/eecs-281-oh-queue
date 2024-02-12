import {ChakraProvider} from "@chakra-ui/react";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {GOOGLE_OAUTH_CLIENT_ID} from "@/service_components/ServiceParameters";
import theme from "@/styles/Theme";

export default function App({Component, pageProps}) {
    return (
        <ChakraProvider theme={theme}>
            <GoogleOAuthProvider clientId={GOOGLE_OAUTH_CLIENT_ID}>
                <Component {...pageProps} />
            </GoogleOAuthProvider>
        </ChakraProvider>
    );
}
