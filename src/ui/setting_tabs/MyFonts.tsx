import { Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFonts } from "../../hooks/useFonts";
import { useSettingStore } from "../../hooks/useSettingStore";
import { DispatchType } from "../../types/IEvents";
import { ColorSchemeType } from "../../types/ISetting";
import type { ISpriteConfig } from "../../types/ISpriteConfig";
import { FontCardType } from "../../types/components/type";
import { PrimaryColor, noFontDialog } from "../../utils";
import { handleSettingChange } from "../../utils/handleSettingChange";
import { getAppSettings, setConfig } from "../../utils/settings";
import FontCard from "../components/FontCard";
import AddCard from "./my_fonts/AddCard";

export function MyFonts() {
	const { refetch } = useFonts();
	const { t } = useTranslation();
	const { theme: colorScheme, fonts, setFonts } = useSettingStore();

	const removeFont = useCallback(
		async (fontId: string) => {
			const userFontConfig = await getAppSettings({ configName: "fonts.json" });
			let removedFontName = "";
			const newConfig = userFontConfig.filter((font: ISpriteConfig) => {
				if (font.id === fontId) removedFontName = font.name;
				return font.id !== fontId;
			});

			setConfig({ configName: "fonts.json", newConfig: newConfig });
			setFonts(newConfig);

			// manually remove fontCard dom to fix flickering problem
			const fontCardDom = document.getElementById(`fontCard-id-${fontId}`);
			if (fontCardDom) fontCardDom.remove();

			if (newConfig.length === 0) noFontDialog();

			// update font window to show new font
			handleSettingChange(DispatchType.RemoveFont, fontId);

			notifications.show({
				message: t("font name has been removed", { name: removedFontName }),
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

			refetch();
		},
		[t, refetch, colorScheme, setFonts],
	);

	// we don't put fonts as dependency because it will cause flickering when we remove font
	// so we manually remove fontCard dom in removeFont function
	const FontCards = useMemo(() => {
		return fonts.map((font: ISpriteConfig, index: number) => {
			return (
				<FontCard
					key={font.id}
					font={font}
					btnLabel={t("Remove")}
					type={FontCardType.Remove}
					btnFunction={() => removeFont(font.id as string)}
				/>
			);
		});
	}, [t, removeFont, fonts]);

	return (
		<>
			<Box
				style={{
					display: "grid",
					placeItems: "center",
					gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
					gridGap: "1rem",
				}}
			>
				{FontCards}
				<AddCard />
			</Box>
		</>
	);
}

export default memo(MyFonts);
