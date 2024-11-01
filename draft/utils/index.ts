import { confirm } from "@tauri-apps/api/dialog";
import { isAbsolute } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { WebviewWindow } from "@tauri-apps/api/window";
import i18next from "i18next";
import { error } from "tauri-plugin-log-api";

export const PrimaryColor = "blue";
export const ButtonVariant = "outline";
export const CanvasSize = 224;

export const noFontDialog = () => {
	error("No font found");
	confirm(
		i18next.t(
			"Nya~ Oh, dear friend! In this whimsical realm of mine, where magic and wonder intertwine, alas, there are no delightful fonts to be found. But fret not! Fear not! For you hold the power to change this tale. Simply venture into the enchanting settings and add a touch of furry companionship to make our world even more adorable and divine! Onegai~",
		),
		{ title: "ZingFont Dialog", type: "info" },
	).then((ok) => {
		// close the font window
		WebviewWindow.getByLabel("main")?.close();
	});
};

/**
 * since we allow custom font, and webview doesn't allow access to local file, we convert the file
 * to asset protocol and load it. though relative path won't work with convertFileSrc
 */
export const convertFileToAssetProtocol = async (filePath: string) => {
	const absolute = await isAbsolute(filePath);
	if (absolute) return convertFileSrc(filePath);

	return filePath;
};
