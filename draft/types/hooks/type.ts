import type { ColorScheme } from "../ISetting";
import type { ISpriteConfig } from "../ISpriteConfig";

export interface ISettingStoreVariables {
	language: string;
	theme: ColorScheme;
	allowFontAboveTaskbar: boolean;
	allowAutoStartUp: boolean;
	allowFontInteraction: boolean;
	allowFontClimbing: boolean;
	allowOverrideFontScale: boolean;
	fontScale: number;
	fonts: ISpriteConfig[];
	defaultFont: ISpriteConfig[];
}

export interface ISettingStoreState extends ISettingStoreVariables {
	setLanguage: (newLanguage: string) => void;
	setTheme: (newTheme: ColorScheme) => void;
	setAllowFontAboveTaskbar: (newBoolean: boolean) => void;
	setAllowAutoStartUp: (newBoolean: boolean) => void;
	setAllowFontInteraction: (newBoolean: boolean) => void;
	setAllowFontClimbing: (newBoolean: boolean) => void;
	setAllowOverrideFontScale: (newBoolean: boolean) => void;
	setFontScale: (fontScale: number) => void;
	setFonts: (newFonts: ISpriteConfig[]) => void;
	setDefaultFont: (newDefaultFont: ISpriteConfig[]) => void;
}

export interface ISettingTabState {
	page: number;
	setPage: (page: number) => void;
}

export interface IFontStateStore {
	fontStates: Record<string, Array<string>>;
	setFontStates: (newFontStates: Record<string, Array<string>>) => void;
	storeDictFontStates: (fontName: string, fontState: Array<string>) => void;
}
