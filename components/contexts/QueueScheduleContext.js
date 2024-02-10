import {createContext} from "react";

const QueueScheduleContext = createContext({
    id: undefined,
    selectedQueueName: undefined,
    status: {}
});

export default QueueScheduleContext;