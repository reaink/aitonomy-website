import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Store = {
  isMobile: boolean;
  sideBarIsOpen: boolean;
  welcomeModalIsOpen: boolean;
  welcomeModalIsReabled: boolean;
  setSideBarIsOpen: (isOpen: boolean) => void;
  setWelcomeModalIsOpen: (isOpen: boolean) => void;
  setWelcomeModalIsReabled: (isReabled: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
};

export const checkIsMobile = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 768px)").matches;

export const useAppearanceStore = create<Store>()(
  persist(
    (set) => ({
      isMobile: checkIsMobile(),
      sideBarIsOpen: true,
      welcomeModalIsOpen: false,
      welcomeModalIsReabled: false,
      setSideBarIsOpen: (isOpen: boolean) => set({ sideBarIsOpen: isOpen }),
      setWelcomeModalIsOpen: (isOpen: boolean) =>
        set({ welcomeModalIsOpen: isOpen }),
      setWelcomeModalIsReabled: (isReabled: boolean) =>
        set({ welcomeModalIsReabled: isReabled }),
      setIsMobile: (isMobile: boolean) => set({ isMobile }),
    }),
    { name: "appearance", storage: createJSONStorage(() => localStorage) }
  )
);

if (typeof window !== "undefined") {
  let resizeListenerAdded = false;

  const addResizeListener = () => {
    if (!resizeListenerAdded) {
      window.addEventListener("resize", () => {
        useAppearanceStore.getState().setIsMobile(checkIsMobile());
      });
      resizeListenerAdded = true;
    }
  };

  addResizeListener();
}
