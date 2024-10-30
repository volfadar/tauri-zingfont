import type { ISpriteConfig } from "./ISpriteConfig";

export type EventValue = boolean | string | ISpriteConfig | number;

export type TRenderEventListener = {
	event: string;
	windowLabel: string;
	payload: {
		dispatchType: DispatchType;
		message: string;
		value: EventValue;
	};
	id: number;
};

export enum EventType {
	SettingWindowToFontOverlay = "settingWindowToFontOverlay",
}

export enum DispatchType {
	ChangeAppLanguage = "Change app language",
	ChangeAppTheme = "Change app theme",
	SwitchAutoWindowStartUp = "Switch auto window start up",
	SwitchFontAboveTaskbar = "Switch font above taskbar",
	SwitchAllowFontInteraction = "Switch allow font interaction",
	SwitchAllowFontClimbing = "Switch allow font climbing",
	AddFont = "Add font",
	RemoveFont = "RemoveFont",
	OverrideFontScale = "Override font scale",
	ChangeFontScale = "Change font scale",
}
