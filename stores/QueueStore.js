import moment from "moment";
import {create} from "zustand";

const useQueueStore = create((set, get) => ({
    selectedQueueId: undefined,
    selectedQueueName: undefined,
    status: {
        userInQueue: false,
        signedUpUid: undefined,
        currentEvents: [],
        override: undefined
    },

    setSelectedQueue: (fn) => set(state => {
        const updated = fn({selectedQueueId: state.selectedQueueId, selectedQueueName: state.selectedQueueName})
        return {selectedQueueId: updated.selectedQueueId, selectedQueueName: updated.selectedQueueName};
    }),

    setStatus: (fn) => set(state => {
        const updated = fn(state.status);
        return {status: updated};
    }),

    isQueueOpen: (atTime) => {
        const override = get().status.override;
        const currentEvents = get().status.currentEvents;

        if (override && override.type === "open") {
            if (atTime.isBetween(moment.unix(override.from_date_time), moment.unix(override.to_date_time))) {
                return true;
            }
        }

        if (override && override.type === "close") {
            if (atTime.isBetween(moment.unix(override.from_date_time), moment.unix(override.to_date_time))) {
                return false;
            }
        }

        if (currentEvents.length === 0) {
            return false;
        }

        const currentEvent = currentEvents.find(event => {
            return moment(event.start).subtract(2, 'seconds').isBefore(atTime) && moment(event.end).isAfter(atTime);
        });

        return currentEvent !== undefined;
    }
}));

export default useQueueStore;