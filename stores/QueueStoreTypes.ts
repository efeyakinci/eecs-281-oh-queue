import {Announcement} from "@/types/QueueTypes";
import {Moment} from "moment";

export type Event = {
    start: number;
    end: number;
}

export type Override = {
    type: 'open' | 'close';
    from_date_time: number;
    to_date_time: number;
}

export type QueueStatus = {
    userInQueue: boolean;
    signedUpUid?: string;
    events: Event[];
    announcements: Announcement[];
    override?: Override;
}

export type QueueState = {
    selectedQueueId?: string;
    selectedQueueName?: string;
    isUserStaff: boolean;
    status: QueueStatus;

    setSelectedQueue: (fn: UpdateQueueFn) => void;
    setStatus: (fn: UpdateStatusFn) => void;
    setIsUserStaff: (isStaff: boolean) => void;
    isQueueOpen: (atTime: Moment) => boolean;
}

export type UpdateQueueFn = {
    (queue: { selectedQueueId?: string; selectedQueueName?: string }): { selectedQueueId?: string; selectedQueueName?: string };
}

export type UpdateStatusFn = {
    (status: QueueStatus): QueueStatus;
}