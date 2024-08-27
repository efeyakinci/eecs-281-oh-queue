import {io} from 'socket.io-client';
import {SERVICE_URL} from "@/service_components/ServiceParameters";
import {Announcement} from "@/types/QueueTypes";

enum QueueEvents {
    UPDATE = 'queue:queue_update',
    DATA_UPDATE = 'queue:data_update',
    SUBSCRIBE = 'queue:subscribe',
    UNSUBSCRIBE = 'queue:unsubscribe',
    JOIN = 'queue:join',
    LEAVE = 'queue:leave',
    ITEM_INFO = 'queue:item_info',
    REQUEST_UPDATE = 'queue:request_update',
    HELP_STUDENT = 'queue:help_student',
    PIN_STUDENT = 'queue:pin_student',
    STUDENT_HELPED = 'queue:student_helped',
    BEING_HELPED = 'queue:being_helped',
    SEND_MESSAGE = 'queue:send_message',
    RECEIVE_MESSAGE = 'queue:receive_message',
    BROADCAST_MESSAGE = 'queue:broadcast_message',
    REQUEST_HEARTBEAT = 'queue:request_heartbeat',
    HEARTBEAT = 'queue:heartbeat',
    ERROR = 'queue:error',
    UPDATE_SELF = 'queue:update_self',
    CLEAR_QUEUE = 'queue:clear_queue',
    OVERRIDE_QUEUE_SCHEDULE = 'queue:override_queue_schedule',
    SYNC_CALENDAR = 'queue:sync_calendar',
    ADD_ANNOUCEMENT = 'queue:add_announcement',
    REMOVE_ANNOUCEMENT = 'queue:remove_announcement',
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    CHECK_IF_STAFF = 'queue:check_staff'
}

const AuthEvents = {
    GOOGLE_LOGIN: 'auth:google_login',
    TOKEN_LOGIN: 'auth:token_login',
    LOGOUT: 'auth:logout',
}

const socket = io(SERVICE_URL, {
    transports: ['websocket']
});

socket.on('connect', () => {
    if (!global?.window) return;

    const creds = localStorage.getItem('credentials');

    if (creds) {
        const {token} = JSON.parse(creds);
        tokenLogin(token, () => {});
    }
})

type EventHandler = (data?: any) => void;

export const setOnReconnect = (handler: EventHandler) => {
    socket.on('connect', handler);
    socket.on('reconnect', handler);

    return () => {
        socket.off('reconnect', handler);
        socket.off('connect', handler);
    }
}

export const subscribeToQueue = (queueId: string) => {
    socket.emit('queue:subscribe', {queue_id: queueId});
};

export const unsubscribeFromQueue = (queueId: string) => {
    socket.emit('queue:unsubscribe', {queue_id: queueId});
}

type JoinQueueParams = {
    help_description: string,
    location: string,
    time_requested: number
}

export const joinQueue = (queueId: string, {help_description, location, time_requested}: JoinQueueParams) => {
    socket.emit('queue:join', {queue_id: queueId, help_description, location, time_requested}, () => {});
}

export const leaveQueue = (queueId: string, uid: string) => {
    socket.emit(QueueEvents.LEAVE, {queue_id: queueId, uid});
}

export const loginWithGoogle = (access_token: string, login_callback_handler: EventHandler) => {
    socket.emit(AuthEvents.GOOGLE_LOGIN, {access_token}, login_callback_handler);
}

export const tokenLogin = (token: string, reauth_callback_handler: EventHandler) => {
    socket.emit(AuthEvents.TOKEN_LOGIN, {token}, reauth_callback_handler);
}

export const queryIfStaff = (queueId: string, callback: EventHandler) => {
    socket.emit(QueueEvents.CHECK_IF_STAFF, {queue_id: queueId}, callback);
}

export const logout = () => {
    const logoutPromise = new Promise((resolve, reject) => {
        socket.on('auth:logout:response', (data) => {
            console.log("Logout response", data);
            resolve(data);
        });
    });

    socket.emit('auth:logout');

    return logoutPromise;
}

export const setQueueUpdateHandler = (handler: EventHandler) => {
    socket.on(QueueEvents.UPDATE, handler);

    return () => {
        socket.off(QueueEvents.UPDATE, handler);
    }
}

export const setQueueDataUpdateHandler = (handler: EventHandler) => {
    socket.on(QueueEvents.DATA_UPDATE, handler);

    return () => {
        socket.off(QueueEvents.DATA_UPDATE, handler);
    }
}

export const requestQueueUpdate = (queueId: string) => {
    console.log("Requesting queue update", queueId)
    socket.emit(QueueEvents.REQUEST_UPDATE, {queue_id: queueId});
}

export const requestItemInfo = (queueId: string, itemIds: string[], callback: EventHandler) => {
    socket.emit(QueueEvents.ITEM_INFO, {queue_id: queueId, uids: itemIds}, callback);
}

export const helpStudent = (queueId: string, uid: string, help: boolean) => {
    socket.emit(QueueEvents.HELP_STUDENT, {queue_id: queueId, uid, is_helped: help});
}

export const markStudentAsWaiting = (queueId: string, uid: string, is_in_waiting_room: boolean) => {
    socket.emit(QueueEvents.PIN_STUDENT, {queue_id: queueId, uid, is_in_waiting_room});
}

export const doneHelpingStudent = (queueId: string, uid: string) => {
    socket.emit(QueueEvents.STUDENT_HELPED, {queue_id: queueId, uid});
}

export const setOnBeingHelped = (handler: EventHandler) => {
    socket.on(QueueEvents.BEING_HELPED, handler);

    return () => {
        socket.off(QueueEvents.BEING_HELPED, handler);
    }
}

export const setOnMessageReceived = (handler: EventHandler) => {
    socket.on(QueueEvents.RECEIVE_MESSAGE, handler);

    return () => {
        socket.off(QueueEvents.RECEIVE_MESSAGE, handler);
    }
}

export const sendMessage = (queueId: string, message: string, uniqname: string) => {
    socket.emit(QueueEvents.SEND_MESSAGE, {queue_id: queueId, message, to_uniqname: uniqname});
}

export const broadcastMessage = (queueId: string, message: string) => {
    socket.emit(QueueEvents.BROADCAST_MESSAGE, {queue_id: queueId, message});
}

export const requestHeartbeat = (queueId: string, timeToRespond: number) => {
    socket.emit(QueueEvents.REQUEST_HEARTBEAT, {queue_id: queueId, time_to_respond: timeToRespond});
}

export const setOnHeartbeat = (handler: EventHandler) => {
    socket.on(QueueEvents.REQUEST_HEARTBEAT, handler);

    return () => {
        socket.off(QueueEvents.REQUEST_HEARTBEAT, handler);
    }
}

export const sendHeartbeat = (requestId: string) => {
    socket.emit(QueueEvents.HEARTBEAT, {request_id: [requestId]});
}

export const setErrorMessageHandler = (handler: EventHandler) => {
    socket.on(QueueEvents.ERROR, handler);

    return () => {
        socket.off(QueueEvents.ERROR, handler);
    }
}

export const updateSelf = (queueId: string, uid: string, data: any) => {
    socket.emit(QueueEvents.UPDATE_SELF, {queue_id: queueId, uid, updated_fields: {...data}});
}

export const clearQueue = (queueId: string) => {
    socket.emit(QueueEvents.CLEAR_QUEUE, {queue_id: queueId});
}

export const overrideQueueSchedule = (queueId: string, override_type: 'open' | 'close', from_date_time: number, to_date_time: number) => {
    socket.emit(QueueEvents.OVERRIDE_QUEUE_SCHEDULE, {queue_id: queueId, override: {
        type: override_type,
        from_date_time,
        to_date_time
    }});
}

export const syncCalendar = (queueId: string) => {
    socket.emit(QueueEvents.SYNC_CALENDAR, {queue_id: queueId});
}

export const addAnnouncement = (queueId: string, annoucement: Announcement) => {
    socket.emit(QueueEvents.ADD_ANNOUCEMENT, {queue_id: queueId, ...annoucement});
}

export const removeAnnouncement = (queueId: string, annoucementId: string) => {
    socket.emit(QueueEvents.REMOVE_ANNOUCEMENT, {queue_id: queueId, announcement_id: annoucementId});
}