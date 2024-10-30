import i18next from "i18next";
import { useQuery } from "react-query";
import { isEnabled } from "tauri-plugin-autostart-api";
import { error } from "tauri-plugin-log-api";
import defaultSettings from "../../src-tauri/src/app/default/settings.json";
import type { ISettingStoreVariables } from "../types/hooks/type";
import { getAppSettings } from "../utils/settings";
import { useSettingStore } from "./useSettingStore";

const {
	setLanguage,
	setTheme,
	setAllowAutoStartUp,
	setAllowFontAboveTaskbar,
	setAllowFontInteraction,
	setAllowOverrideFontScale,
	setFontScale,
	setAllowFontClimbing,
} = useSettingStore.getState();

const getSettings = async () => {
	const setting: ISettingStoreVariables = await getAppSettings({
		configName: "settings.json",
	});

	if (setting === undefined) {
		error("Settings is undefined");
		throw new Error("Settings is undefined");
	}

	if (i18next.language !== setting.language)
		i18next.changeLanguage(setting.language);
	setLanguage(setting.language ?? defaultSettings.language);
	setTheme(setting.theme ?? defaultSettings.theme);
	setAllowAutoStartUp(await isEnabled());
	setAllowFontAboveTaskbar(
		setting.allowFontAboveTaskbar ?? defaultSettings.allowFontAboveTaskbar,
	);
	setAllowFontInteraction(
		setting.allowFontInteraction ?? defaultSettings.allowFontInteraction,
	);
	setAllowFontClimbing(
		setting.allowFontClimbing ?? defaultSettings.allowFontClimbing,
	);
	setAllowOverrideFontScale(
		setting.allowOverrideFontScale ?? defaultSettings.allowOverrideFontScale,
	);
	setFontScale(setting.petScale ?? defaultSettings.petScale);
};

export function useSettings() {
	return useQuery("settings", getSettings, {
		refetchOnWindowFocus: false,
		// disable cache
		cacheTime: 0,
	});
}
