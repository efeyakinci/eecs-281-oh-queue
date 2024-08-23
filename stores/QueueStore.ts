import moment, {Moment} from "moment";
import {create} from "zustand";
import {QueueState, UpdateQueueFn, UpdateStatusFn} from "./QueueStoreTypes";

const useQueueStore = create<QueueState>((set, get) => ({
    selectedQueueId: undefined,
    selectedQueueName: undefined,
    isUserStaff: false,
    status: {
        userInQueue: false,
        signedUpUid: undefined,
        events: [],
        announcements: [],
        override: undefined,
    },

    setSelectedQueue: (fn: UpdateQueueFn) => set(state => {
        const updated = fn({ selectedQueueId: state.selectedQueueId, selectedQueueName: state.selectedQueueName });
        return { selectedQueueId: updated.selectedQueueId, selectedQueueName: updated.selectedQueueName};
    }),

    setStatus: (fn: UpdateStatusFn) => set(state => {
        const updated = fn(state.status);
        return { status: updated };
    }),

    setIsUserStaff: (isStaff: boolean) => set({ isUserStaff: isStaff }),

    isQueueOpen: (atTime: Moment) => {
        const override = get().status.override;
        const events = get().status.events;

        if (override) {
            if (override.type === "open" && atTime.isBetween(moment.unix(override.from_date_time), moment.unix(override.to_date_time))) {
                return true;
            }
            if (override.type === "close" && atTime.isBetween(moment.unix(override.from_date_time), moment.unix(override.to_date_time))) {
                return false;
            }
        }

        if (events.length === 0) {
            return false;
        }

        const currentEvent = events.find(event => moment(event.start).subtract(2, 'seconds').isBefore(atTime) && moment(event.end).isAfter(atTime));

        return currentEvent !== undefined;
    }
}));

export default useQueueStore;