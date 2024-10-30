import i18next from "i18next";
import { info } from "tauri-plugin-log-api";
import { useSettingStore } from "../hooks/useSettingStore";
import { DispatchType } from "../types/IEvents";
import type { ColorScheme } from "../types/ISetting";
import type { ISpriteConfig } from "../types/ISpriteConfig";
import { emitUpdateFontsEvent } from "./event";
import { setSettings, toggleAutoStartUp } from "./settings";

type IHandleSettingChange = (
	dispatchType: DispatchType,
	newValue: string | boolean | ISpriteConfig | number,
) => void;
export const handleSettingChange: IHandleSettingChange = (
	dispatchType,
	newValue,
) => {
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

	info(`Change setting, type: ${dispatchType}, value: ${newValue}`);

	switch (dispatchType) {
		case DispatchType.ChangeAppLanguage:
			setSettings({ setKey: "language", newValue: newValue });
			setLanguage(newValue as string);
			i18next.changeLanguage(newValue as string);
			localStorage.setItem("language", newValue as string);
			return;
		case DispatchType.ChangeAppTheme:
			setSettings({ setKey: "theme", newValue: newValue });
			setTheme(newValue as ColorScheme);
			localStorage.setItem("theme", newValue as string);
			return;
		case DispatchType.SwitchAutoWindowStartUp:
			// auto start up doesn't need to be saved in settings.json
			toggleAutoStartUp(newValue as boolean);
			setAllowAutoStartUp(newValue as boolean);
			return;
		case DispatchType.SwitchFontAboveTaskbar:
			setSettings({ setKey: "allowFontAboveTaskbar", newValue: newValue });
			setAllowFontAboveTaskbar(newValue as boolean);
			emitUpdateFontsEvent({ dispatchType, newValue });
			return;
		case DispatchType.SwitchAllowFontInteraction:
			setSettings({ setKey: "allowFontInteraction", newValue: newValue });
			setAllowFontInteraction(newValue as boolean);
			emitUpdateFontsEvent({ dispatchType, newValue });
			return;
		case DispatchType.SwitchAllowFontClimbing:
			setSettings({ setKey: "allowFontClimbing", newValue: newValue });
			setAllowFontClimbing(newValue as boolean);
			emitUpdateFontsEvent({ dispatchType, newValue });
			return;
		case DispatchType.AddFont:
			emitUpdateFontsEvent({ dispatchType, newValue });
			return;
		case DispatchType.RemoveFont:
			emitUpdateFontsEvent({ dispatchType, newValue });
			return;
		case DispatchType.OverrideFontScale:
			setSettings({
				setKey: "allowOverrideFontScale",
				newValue: newValue,
			});
			setAllowOverrideFontScale(newValue as boolean);
			emitUpdateFontsEvent({ dispatchType, newValue });
			return;
		case DispatchType.ChangeFontScale:
			setSettings({ setKey: "fontScale", newValue: newValue });
			setFontScale(newValue as number);
			emitUpdateFontsEvent({ dispatchType, newValue });
			return;
		default:
			return;
	}
};
