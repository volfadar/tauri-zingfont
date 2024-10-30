import { WebviewWindow } from "@tauri-apps/api/window";
import { type DispatchType, EventType } from "../types/IEvents";
import type { ISpriteConfig } from "../types/ISpriteConfig";

interface IEmitReRenderFontsEvent {
	dispatchType: DispatchType;
	newValue?: boolean | string | ISpriteConfig | number;
}

export const emitUpdateFontsEvent = async ({
	dispatchType,
	newValue,
}: IEmitReRenderFontsEvent) => {
	// get the window instance by its label
	const mainWindow = WebviewWindow.getByLabel("main");

	if (mainWindow) {
		await mainWindow.emit(EventType.SettingWindowToFontOverlay, {
			message: "Hey, re-render fonts! :)",
			dispatchType: dispatchType,
			value: newValue,
		});
	}
};
