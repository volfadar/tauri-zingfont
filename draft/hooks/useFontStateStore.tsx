import { create } from "zustand";
import type { IFontStateStore } from "../types/hooks/type";

export const useFontStateStore = create<IFontStateStore>((set) => ({
	fontStates: {},
	setFontStates: (newFontStates) => {
		set({ fontStates: newFontStates });
	},
	storeDictFontStates(fontName, fontState) {
		set((state) => ({
			fontStates: {
				...state.fontStates,
				[fontName]: fontState,
			},
		}));
	},
}));
