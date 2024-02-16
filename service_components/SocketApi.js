import {io} from 'socket.io-client';
import {SERVICE_URL} from "@/service_components/ServiceParameters";

const as_response = (event_type) => {
    return event_type + ':response';
}

const QueueEvents = {
    UPDATE: 'queue:queue_update',
    DATA_UPDATE: 'queue:data_update',
    SUBSCRIBE: 'queue:subscribe',
    UNSUBSCRIBE: 'queue:unsubscribe',
    JOIN: 'queue:join',
    LEAVE: 'queue:leave',
    ITEM_INFO: 'queue:item_info',
    REQUEST_UPDATE: 'queue:request_update',
    HELP_STUDENT: 'queue:help_student',
    PIN_STUDENT: 'queue:pin_student',
    STUDENT_HELPED: 'queue:student_helped',
    BEING_HELPED: 'queue:being_helped',
    SEND_MESSAGE: 'queue:send_message',
    RECEIVE_MESSAGE: 'queue:receive_message',
    BROADCAST_MESSAGE: 'queue:broadcast_message',
    REQUEST_HEARTBEAT: 'queue:request_heartbeat',
    HEARTBEAT: 'queue:heartbeat',
    ERROR: 'queue:error',
    CLEAR_QUEUE: 'queue:clear_queue',
    OVERRIDE_QUEUE_SCHEDULE: 'queue:override_queue_schedule',
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

export const subscribeToQueue = (queueId) => {
    socket.emit('queue:subscribe', {queue_id: queueId});
};

export const unsubscribeFromQueue = (queueId) => {
    socket.emit('queue:unsubscribe', {queue_id: queueId});
}

export const joinQueue = (queueId, {help_description, location, time_requested}) => {
    socket.emit('queue:join', {queue_id: queueId, help_description, location, time_requested}, () => {});
}

export const leaveQueue = (queueId, uid) => {
    socket.emit(QueueEvents.LEAVE, {queue_id: queueId, uid});
}

export const loginWithGoogle = (access_token, login_callback_handler) => {
    socket.emit(AuthEvents.GOOGLE_LOGIN, {access_token}, login_callback_handler);
}

export const tokenLogin = (token, reauth_callback_handler) => {
    socket.emit(AuthEvents.TOKEN_LOGIN, {token}, reauth_callback_handler);
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

export const setQueueUpdateHandler = (handler) => {
    socket.on(QueueEvents.UPDATE, handler);

    return () => {
        socket.off(QueueEvents.UPDATE, handler);
    }
}

export const setQueueDataUpdateHandler = (handler) => {
    socket.on(QueueEvents.DATA_UPDATE, handler);

    return () => {
        socket.off(QueueEvents.DATA_UPDATE, handler);
    }
}

export const requestQueueUpdate = (queueId) => {
    console.log("Requesting queue update", queueId)
    socket.emit(QueueEvents.REQUEST_UPDATE, {queue_id: queueId});
}

export const requestItemInfo = (queueId, itemIds, callback) => {
    socket.emit(QueueEvents.ITEM_INFO, {queue_id: queueId, uids: itemIds}, callback);
}

export const helpStudent = (queueId, uid, help) => {
    socket.emit(QueueEvents.HELP_STUDENT, {queue_id: queueId, uid, is_helped: help});
}

export const markStudentAsWaiting = (queueId, uid, is_in_waiting_room) => {
    socket.emit(QueueEvents.PIN_STUDENT, {queue_id: queueId, uid, is_in_waiting_room});
}

export const doneHelpingStudent = (queueId, uid) => {
    socket.emit(QueueEvents.STUDENT_HELPED, {queue_id: queueId, uid});
}

export const setOnBeingHelped = (handler) => {
    socket.on(QueueEvents.BEING_HELPED, handler);

    return () => {
        socket.off(QueueEvents.BEING_HELPED, handler);
    }
}

export const setOnMessageReceived = (handler) => {
    socket.on(QueueEvents.RECEIVE_MESSAGE, handler);

    return () => {
        socket.off(QueueEvents.RECEIVE_MESSAGE, handler);
    }
}

export const sendMessage = (queueId, message, uniqname) => {
    socket.emit(QueueEvents.SEND_MESSAGE, {queue_id: queueId, message, to_uniqname: uniqname});
}

export const broadcastMessage = (queueId, message) => {
    socket.emit(QueueEvents.BROADCAST_MESSAGE, {queue_id: queueId, message});
}

export const requestHeartbeat = (queueId, timeToRespond) => {
    socket.emit(QueueEvents.REQUEST_HEARTBEAT, {queue_id: queueId, time_to_respond: timeToRespond});
}

export const setOnHeartbeat = (handler) => {
    socket.on(QueueEvents.REQUEST_HEARTBEAT, handler);

    return () => {
        socket.off(QueueEvents.REQUEST_HEARTBEAT, handler);
    }
}

export const sendHeartbeat = (requestId) => {
    socket.emit(QueueEvents.HEARTBEAT, {request_id: requestId});
}

export const setErrorMessageHandler = (handler) => {
    socket.on(QueueEvents.ERROR, handler);

    return () => {
        socket.off(QueueEvents.ERROR, handler);
    }
}

export const updateSelf = (queueId, uid, data) => {
    socket.emit(QueueEvents.UPDATE_SELF, {queue_id: queueId, uid, updated_fields: {...data}});
}

export const clearQueue = (queueId) => {
    socket.emit(QueueEvents.CLEAR_QUEUE, {queue_id: queueId});
}

export const overrideQueueSchedule = (queueId, override_type, from_date_time, to_date_time) => {
    socket.emit(QueueEvents.OVERRIDE_QUEUE_SCHEDULE, {queue_id: queueId, override: {
        type: override_type,
        from_date_time,
        to_date_time
    }});
}