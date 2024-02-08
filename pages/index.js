import { Inter } from "next/font/google";
import QueueWaiter from "@/components/oh-queue/QueueWaiter";
import {Box, ChakraProvider, VStack} from "@chakra-ui/react";
import QueueContainer from "@/components/oh-queue/QueueContainer";
import Navbar from "@/components/oh-queue/Navbar";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
        <VStack spacing={0}>
            <Navbar w={'100%'} />
            <QueueContainer w={'100%'} mt={8}/>
            <Box h={16} />
        </VStack>
  );
}
