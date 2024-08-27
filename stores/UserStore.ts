import { create } from 'zustand'

export interface UserState {
    uniqname: string;
    token: string;
    isLoggedIn: boolean;
    onLogin: (token: string, uniqname: string) => void;
    onLogout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    uniqname: "",
    token: "",
    isLoggedIn: false,
    onLogin: (token: string, uniqname: string) => {
        return set({token, uniqname, isLoggedIn: true})
    },
    onLogout: () => set({token: "", uniqname: "", isLoggedIn: false}),
}));