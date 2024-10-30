import { Box, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDefaultFonts } from "../../hooks/useFonts";
import { useSettingStore } from "../../hooks/useSettingStore";
import { DispatchType } from "../../types/IEvents";
import { ColorSchemeType, DefaultConfigName } from "../../types/ISetting";
import type { ISpriteConfig } from "../../types/ISpriteConfig";
import { FontCardType } from "../../types/components/type";
import { PrimaryColor } from "../../utils";
import { handleSettingChange } from "../../utils/handleSettingChange";
import { getAppSettings, setConfig } from "../../utils/settings";
import FontCard from "../components/FontCard";

function FontShop() {
	const { refetch } = useDefaultFonts();
	const { setFonts, defaultFont, theme: colorScheme } = useSettingStore();
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState("");

	const addFontToConfig = useCallback(
		async (font: ISpriteConfig) => {
			const userFontConfig = await getAppSettings({ configName: "fonts.json" });
			userFontConfig.push({ ...font, id: crypto.randomUUID() });

			setConfig({ configName: "fonts.json", newConfig: userFontConfig });
			setFonts(userFontConfig);

			if (!WebviewWindow.getByLabel("main")) await invoke("reopen_main_window");

			notifications.show({
				message: t("font name has been added to your realm", {
					name: font.name,
				}),
				title: t("Font Added"),
				color: PrimaryColor,
				icon: <IconCheck size="1rem" />,
				withBorder: true,
				autoClose: 800,
				style: (theme) => ({
					backgroundColor:
						colorScheme === ColorSchemeType.Dark
							? theme.colors.dark[7]
							: theme.colors.gray[0],
				}),
			});

			// update font window to show new font
			handleSettingChange(DispatchType.AddFont, font);
		},
		[t, colorScheme, setFonts],
	);

	const removeCustomFont = useCallback(
		async (font: ISpriteConfig) => {
			const petLinker = await getAppSettings({
				configName: DefaultConfigName.PET_LINKER,
			});

			if (!petLinker) return;

			// remove custom font from linker
			const newFontLinker = petLinker.filter(
				(p: ISpriteConfig) => p.name === font.name,
			);
			setConfig({
				configName: DefaultConfigName.PET_LINKER,
				newConfig: newFontLinker,
			});

			notifications.show({
				message: t("font name has been removed from your realm", {
					name: font.name,
				}),
				title: t("Font Removed"),
				color: PrimaryColor,
				icon: <IconCheck size="1rem" />,
				withBorder: true,
				autoClose: 800,
				style: (theme) => ({
					backgroundColor:
						colorScheme === ColorSchemeType.Dark
							? theme.colors.dark[7]
							: theme.colors.gray[0],
				}),
			});

			const petCardDom = document.getElementById(`petCard-id-${font.customId}`);
			if (petCardDom) petCardDom.remove();
			refetch();
		},
		[t, refetch, colorScheme],
	);

	const filteredFonts = useMemo(() => {
		return defaultFont.filter((font) =>
			font.name.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [searchQuery, defaultFont]);

	const FontCards = useMemo(() => {
		return filteredFonts.map((font: ISpriteConfig, index: number) => {
			return (
				<FontCard
					key={index}
					font={font}
					btnLabel={t("Acquire")}
					type={FontCardType.Add}
					btnFunction={() => addFontToConfig(font)}
					btnLabelCustom={t("Remove")}
					btnFunctionCustom={() => removeCustomFont(font)}
				/>
			);
		});
	}, [t, filteredFonts, addFontToConfig, removeCustomFont]);

	return (
		<>
			<TextInput
				placeholder={t("Search for fonts")}
				value={searchQuery}
				onChange={(event) => setSearchQuery(event.currentTarget.value)}
				style={{
					marginBottom: "1rem",
					marginLeft: "1rem",
					marginRight: "1rem",
				}}
			/>
			<Box
				style={{
					display: "grid",
					placeItems: "center",
					gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
					gridGap: "1rem",
				}}
			>
				{FontCards}
			</Box>
		</>
	);
}

export default memo(FontShop);
