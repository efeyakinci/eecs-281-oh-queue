import { create } from 'zustand'

export const useUserStore = create((set) => ({
    uniqname: "",
    token: "",
    isLoggedIn: false,
    onLogin: ({token, uniqname, isStaff}) => {
        return set({token, uniqname, isStaff, isLoggedIn: true})
    },
    onLogout: () => set({token: "", uniqname: "", isStaff: false, isLoggedIn: false}),
}));