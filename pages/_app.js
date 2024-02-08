import "@/styles/globals.css";
import {ChakraProvider} from "@chakra-ui/react";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {GOOGLE_OAUTH_CLIENT_ID} from "@/service_components/ServiceParameters";

export default function App({Component, pageProps}) {
    return (
        <ChakraProvider>
            <GoogleOAuthProvider clientId={GOOGLE_OAUTH_CLIENT_ID}>
                <Component {...pageProps} />
            </GoogleOAuthProvider>
        </ChakraProvider>
    );
}
