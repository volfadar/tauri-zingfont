import { confirm } from "@tauri-apps/api/dialog";
import {
	BaseDirectory,
	copyFile,
	createDir,
	exists,
	readTextFile,
} from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import i18next from "i18next";
import { disable, enable, isEnabled } from "tauri-plugin-autostart-api";
import { error, info } from "tauri-plugin-log-api";
import { Store } from "tauri-plugin-store-api";
import { DefaultConfigName, type IGetAppSetting } from "../types/ISetting";
import type { IFontObject } from "../types/ISpriteConfig";
import { showNotification } from "./notification";

export function toggleAutoStartUp(allowAutoStartUp: boolean) {
	(async () => {
		const hasEnabledStartUp = await isEnabled();

		if (allowAutoStartUp) {
			if (!hasEnabledStartUp) await enable();
		} else if (hasEnabledStartUp) {
			await disable();
		}
	})();
}

// default will return app settings, if key is provided, will return specific key
export async function getAppSettings({
	configName = "settings.json",
	key = "app",
	withErrorDialog = true,
}: IGetAppSetting) {
	const configPath: string = await invoke("combine_config_path", {
		config_name: configName,
	});
	const configExists = await exists(configPath);

	if (!configExists) {
		if (withErrorDialog)
			await confirm(`Could not get data from ${configPath}`, {
				title: "ZingFont Dialog",
				type: "error",
			});

		return;
	}

	const data = await readTextFile(configPath);
	const json = JSON.parse(data);
	return json[key];
}

// set a specific key under object app
// exp: { app: { key: value } }
interface ISetSetting extends IGetAppSetting {
	setKey: string;
	newValue: unknown;
}
export function setSettings({
	configName = "settings.json",
	key = "app",
	setKey,
	newValue,
}: ISetSetting) {
	(async () => {
		const setting: any = await getAppSettings({ configName });
		setting[setKey] = newValue;
		const configPath: string = await invoke("combine_config_path", {
			config_name: configName,
		});
		// if not exist, create new file, so we don't need to check if file exists
		const store = new Store(configPath);
		await store.set(key, setting);
		await store.save();
	})();
}

// this function differs from setSettings because it will replace the whole config file, not just some specific key
export interface ISetConfig extends IGetAppSetting {
	newConfig: unknown;
}
export function setConfig({
	configName = "settings.json",
	key = "app",
	newConfig,
}: ISetConfig) {
	(async () => {
		const configPath: string = await invoke("combine_config_path", {
			config_name: configName,
		});
		// if not exist, create new file, so we don't need to check if file exists
		const store = new Store(configPath);
		await store.set(key, newConfig);
		await store.save();
	})();
}

export async function getNoneExistingConfigFileName({
	configName,
	extension,
	folderName,
}: { configName: string; extension: string; folderName?: string }) {
	// if file name doesn't exist, return the same name
	// else generate a new name with -1, -2, -3, etc
	const configPath: string = await invoke("combine_config_path", {
		config_name: `${folderName}${configName}${extension}`,
	});
	const configExists = await exists(configPath);
	if (!configExists) return configName;

	let i = 1;

	while (configExists) {
		const newConfigName = `${configName}-${i}`;
		const newConfigPath: string = await invoke("combine_config_path", {
			config_name: `${folderName}${newConfigName}${extension}`,
		});
		const newConfigExists = await exists(newConfigPath);
		if (!newConfigExists) return newConfigName;
		i++;
	}
}

async function updateCustomFontConfig(newCustomFontPath: string) {
	const customFontConfigPath: string = await invoke("combine_config_path", {
		config_name: DefaultConfigName.font_LINKER,
	});
	if (await exists(customFontConfigPath)) {
		const customFontConfig = await getAppSettings({
			configName: DefaultConfigName.font_LINKER,
		});

		if (customFontConfig) {
			customFontConfig.push(newCustomFontPath);
			setConfig({
				configName: DefaultConfigName.font_LINKER,
				newConfig: customFontConfig,
			});
			return;
		}
	}

	setConfig({
		configName: DefaultConfigName.font_LINKER,
		newConfig: [newCustomFontPath],
	});
}

export async function saveCustomFont(fontObject: IFontObject) {
	try {
		info(`Start saving custom font, font name: ${fontObject.name}`);
		fontObject.customId = crypto.randomUUID();
		const uniqueFontFileName = await getNoneExistingConfigFileName({
			configName: fontObject.name as string,
			folderName: "custom-fonts/",
			extension: ".json",
		});
		const userImageSrc = fontObject.imageSrc as string;
		fontObject.imageSrc = (await invoke("combine_config_path", {
			config_name: `assets/${uniqueFontFileName}.png`,
		})) as string;

		// create dir if not exist and copy file to assets folder
		await createDir("assets", {
			dir: BaseDirectory.AppConfig,
			recursive: true,
		});
		await copyFile(userImageSrc, fontObject.imageSrc);

		setConfig({
			configName: `custom-fonts/${uniqueFontFileName}.json`,
			newConfig: fontObject,
		});

		// this config is the one that will be used to load custom fonts (act as a list of custom fonts)
		await updateCustomFontConfig(
			await invoke("combine_config_path", {
				config_name: `custom-fonts/${uniqueFontFileName}.json`,
			}),
		);

		showNotification({
			title: i18next.t("Custom Font Added"),
			message: i18next.t(
				"font name has been added to your custom font list, restart ZingFont and check font shop to spawn your custom font",
				{ name: fontObject.name },
			),
		});
		info(`Successfully save custom font, font name: ${fontObject.name}`);
	} catch (err) {
		error(`Error at saveCustomFont: ${err}`);
		showNotification({
			title: i18next.t("Error Adding Custom Font"),
			message: err as any,
			isError: true,
		});
	}
}
