import { type UseQueryResult, useQuery } from "react-query";
import defaultFontConfig from "../config/font_config";
import { DefaultConfigName } from "../types/ISetting";
import { type ISpriteConfig, SpriteType } from "../types/ISpriteConfig";
import { noFontDialog } from "../utils";
import { getAppSettings, setConfig } from "../utils/settings";
import { useSettingStore } from "./useSettingStore";

const { setFonts, setDefaultFont } = useSettingStore.getState();

const getFonts = async () => {
	let saveConfigAgain = false;
	const fonts: ISpriteConfig[] = await getAppSettings({
		configName: "fonts.json",
	});

	if (fonts.length === 0) {
		noFontDialog();
		return [];
	}

	// check if all fonts has unique id if no add id and after all check, save config again
	fonts.forEach((font: ISpriteConfig) => {
		if (!font.id) {
			font.id = crypto.randomUUID();
			saveConfigAgain = true;
		}
	});

	if (saveConfigAgain)
		setConfig({ configName: "fonts.json", newConfig: fonts });

	setFonts(fonts);
};

export function useFonts(): UseQueryResult<unknown, Error> {
	return useQuery("fonts", getFonts, {
		refetchOnWindowFocus: false,
		// disable cache
		cacheTime: 0,
	});
}

const getDefaultFonts = async () => {
	const defaultFonts: ISpriteConfig[] = JSON.parse(
		JSON.stringify(defaultFontConfig),
	);
	const customFonts = await getAppSettings({
		configName: DefaultConfigName.font_LINKER,
		withErrorDialog: false,
	});

	if (customFonts && customFonts.length > 0) {
		for (const fontPath of customFonts) {
			const font: ISpriteConfig = await getAppSettings({
				configName: fontPath,
				withErrorDialog: false,
			});
			if (!font) continue;

			font.type = SpriteType.CUSTOM;
			defaultFonts.push(font);
		}
	}

	setDefaultFont(defaultFonts);
};

export function useDefaultFonts(): UseQueryResult<unknown, Error> {
	return useQuery("defaultFonts", getDefaultFonts, {
		refetchOnWindowFocus: false,
		// disable cache
		cacheTime: 0,
	});
}
