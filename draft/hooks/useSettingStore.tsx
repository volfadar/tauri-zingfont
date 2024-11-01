import { create } from "zustand";
import defaultSettings from "../../src-tauri/src/app/default/settings.json";
import defaultFontConfig from "../config/font_config";
import type { ColorScheme } from "../types/ISetting";
import type { ISettingStoreState } from "../types/hooks/type";

// initialize settings
export const useSettingStore = create<ISettingStoreState>()((set) => ({
	language: localStorage.getItem("language") ?? defaultSettings.language,
	setLanguage: (newLanguage) => {
		set({ language: newLanguage });
	},
	theme:
		(localStorage.getItem("theme") as ColorScheme) ?? defaultSettings.theme,
	setTheme: (newTheme) => {
		set({ theme: newTheme });
	},
	allowFontAboveTaskbar: defaultSettings.allowFontAboveTaskbar ?? false,
	setAllowFontAboveTaskbar: (newBoolean) => {
		set({ allowFontAboveTaskbar: newBoolean });
	},
	allowAutoStartUp: defaultSettings.allowAutoStartUp ?? false,
	setAllowAutoStartUp: (newBoolean) => {
		set({ allowAutoStartUp: newBoolean });
	},
	allowFontInteraction: defaultSettings.allowFontInteraction ?? true,
	setAllowFontInteraction: (newBoolean) => {
		set({ allowFontInteraction: newBoolean });
	},
	allowFontClimbing: defaultSettings.allowFontClimbing ?? true,
	setAllowFontClimbing: (newBoolean) => {
		set({ allowFontClimbing: newBoolean });
	},
	allowOverrideFontScale: defaultSettings.allowFontInteraction ?? true,
	setAllowOverrideFontScale: (newBoolean) => {
		set({ allowOverrideFontScale: newBoolean });
	},
	fontScale: defaultSettings.fontScale ?? 0.7,
	setFontScale: (fontScale) => {
		set({ fontScale: fontScale });
	},
	// not actual settings that was saved in the config file
	// this fonts will be used to track the fonts in user's computer and live update the font if user add/remove font
	fonts: [],
	setFonts: (newFonts) => {
		set({ fonts: [...newFonts] });
	},
	// default font config that will be used in the font shop.
	defaultFont: JSON.parse(JSON.stringify(defaultFontConfig)),
	setDefaultFont: (newDefaultFont) => {
		set({ defaultFont: [...newDefaultFont] });
	},
}));
