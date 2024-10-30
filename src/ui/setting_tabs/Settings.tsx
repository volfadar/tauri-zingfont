import { Select, Slider } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/tauri";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSettingStore } from "../../hooks/useSettingStore";
import languages from "../../locale/languages";
import { DispatchType } from "../../types/IEvents";
import { handleSettingChange } from "../../utils/handleSettingChange";
import SettingButton from "./settings/SettingButton";
import SettingSwitch from "./settings/SettingSwitch";

interface ISettingsContent {
	title: string;
	description: string;
	checked: boolean;
	dispatchType: DispatchType;
	component?: React.ReactNode;
}

function Settings() {
	const { t, i18n } = useTranslation();
	const {
		allowAutoStartUp,
		allowFontAboveTaskbar,
		allowFontInteraction,
		allowOverrideFontScale,
		petScale,
		allowFontClimbing,
	} = useSettingStore();

	const settingSwitches: ISettingsContent[] = [
		{
			title: t("Auto start-up"),
			description: t(
				"Automatically open ZingFont every time u start the computer",
			),
			checked: allowAutoStartUp,
			dispatchType: DispatchType.SwitchAutoWindowStartUp,
		},
		{
			title: t("Font above taskbar"),
			description: t("Make the font float above taskbar (For Window User)"),
			checked: allowFontAboveTaskbar,
			dispatchType: DispatchType.SwitchFontAboveTaskbar,
		},
		{
			title: t("Font interactions"),
			description: t(
				"If allow font interaction turn on, user will be able to drag and move the font around their window",
			),
			checked: allowFontInteraction,
			dispatchType: DispatchType.SwitchAllowFontInteraction,
		},
		{
			title: t("Allow font climb"),
			description: t(
				"If allow font climb turn on, font will be able to climb on the left, right, and top of the window",
			),
			checked: allowFontClimbing,
			dispatchType: DispatchType.SwitchAllowFontClimbing,
		},
		{
			title: t("Override font scale"),
			description: t(
				"Allow the program to adjust all font sizes by a fixed amount determined by your preferences, ignoring any individual font scales",
			),
			checked: allowOverrideFontScale,
			dispatchType: DispatchType.OverrideFontScale,
			component: allowOverrideFontScale && (
				<Slider
					min={0.1}
					max={1}
					defaultValue={petScale}
					my={"sm"}
					step={0.1}
					onChangeEnd={(value) =>
						handleSettingChange(DispatchType.ChangeFontScale, value)
					}
				/>
			),
		},
	];

	const SettingSwitches = settingSwitches.map((setting, index) => {
		return <SettingSwitch {...setting} key={index} />;
	});

	const openConfigFolder = useCallback(async () => {
		const configPath: string = await invoke("combine_config_path", {
			config_name: "",
		});
		await invoke("open_folder", { path: configPath });
	}, []);

	return (
		<>
			{SettingSwitches}
			<SettingButton
				title={t("App Config Path")}
				description={t(
					"The location path of where the app store your config such as settings, fonts, etc",
				)}
				btnLabel={t("Open")}
				btnFunction={openConfigFolder}
			/>
			<Select
				leftSection={<IconLanguage />}
				allowDeselect={false}
				checkIconPosition={"right"}
				my={"sm"}
				label={t("Language")}
				placeholder="Pick one"
				// itemComponent={SelectItem}
				data={languages}
				maxDropdownHeight={400}
				value={i18n.language}
				onChange={(value) =>
					handleSettingChange(DispatchType.ChangeAppLanguage, value as string)
				}
			/>
		</>
	);
}

export default memo(Settings);
