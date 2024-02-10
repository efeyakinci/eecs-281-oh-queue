import {Box, VStack} from "@chakra-ui/react";
import QueueContainer from "@/components/oh-queue/QueueContainer";
import Navbar from "@/components/oh-queue/Navbar";
import Footer from "@/components/oh-queue/Footer";


export default function Home() {
  return (
        <VStack spacing={0}>
            <Navbar w={'100%'} />
            <QueueContainer w={'100%'} mt={8}/>
            <Box h={16} />
            <Footer />
        </VStack>
  );
}
