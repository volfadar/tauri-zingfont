import { create } from "zustand";
import type { IFontStateStore } from "../types/hooks/type";

export const useFontStateStore = create<IFontStateStore>((set) => ({
	petStates: {},
	setFontStates: (newFontStates) => {
		set({ petStates: newFontStates });
	},
	storeDictFontStates(petName, petState) {
		set((state) => ({
			petStates: {
				...state.petStates,
				[petName]: petState,
			},
		}));
	},
}));
