export type Announcement = {
    id: string;
    message: string;
    until?: number;
}

export type QueueEvent = {
    start: number;
    end: number;
}

export type QueueOverride = {
    from_date_time: number;
    to_date_time: number;
    type: "open" | "close";
}

export type QueueWaiter = {
    [x: string]: any;
    uid: string;
    waiter: any;
    onLeaveQueue: any;
    onHelpStudent: any;
    onPinStudent: any;
}