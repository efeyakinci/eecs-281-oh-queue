import {createContext} from "react";

const QueueContext = createContext({
    id: undefined,
    selectedQueueName: undefined,
    status: {}
});

export default QueueContext;