import { writable } from "svelte/store";

export type AuthMode = "signup" | "login";

interface AuthModalState {
  open: boolean;
  mode: AuthMode;
}

function createAuthModalStore() {
  const { subscribe, set } = writable<AuthModalState>({ open: false, mode: "signup" });
  return {
    subscribe,
    show(mode: AuthMode) {
      set({ open: true, mode });
    },
    hide() {
      set({ open: false, mode: "signup" });
    },
  };
}

export const authModal = createAuthModalStore();
