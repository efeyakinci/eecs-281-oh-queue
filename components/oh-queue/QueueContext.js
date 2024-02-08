import {createContext} from "react";

const QueueContext = createContext({
    id: undefined,
    selectedQueueName: undefined
});

export default QueueContext;