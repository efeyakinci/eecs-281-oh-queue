import axios from "axios";
import {SERVICE_URL} from "@/service_components/ServiceParameters";
import {useUserStore} from "@/stores/UserStore";

export const api_client = axios.create({
    baseURL: SERVICE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

const api =  {
    login: async (access_token) => {
        return await api_client.post('/auth/login', {access_token});
    },

    get_queues: async () => {
        return await api_client.get('/queues');
    },

    get_queue_state: async (queue_id) => {
        return await api_client.get(`/queues/${queue_id}/queue`);
    },
}

export default api;