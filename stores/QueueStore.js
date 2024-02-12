import {create} from "zustand";

const useQueueStore = create((set) => ({
    selectedQueueId: undefined,
    selectedQueueName: undefined,
    status: {
        userInQueue: false,
        signedUpUid: undefined
    },

    setSelectedQueue: (fn) => set(state => {
        const updated = fn({selectedQueueId: state.selectedQueueId, selectedQueueName: state.selectedQueueName})
        return {selectedQueueId: updated.selectedQueueId, selectedQueueName: updated.selectedQueueName};
    }),

    setStatus: (fn) => set(state => {
        const updated = fn(state.status);
        return {status: updated};
    })
}));

export default useQueueStore;