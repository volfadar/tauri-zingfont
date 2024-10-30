import {
	ActionIcon,
	AppShell,
	Box,
	Flex,
	ScrollArea,
	Stack,
	useMantineColorScheme,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import {
	IconBuildingStore,
	IconCat,
	IconInfoCircle,
	IconMoonStars,
	IconPaw,
	IconSettings,
	IconSun,
} from "@tabler/icons-react";
import { memo, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useInit from "./hooks/useInit";
import useQueryParams from "./hooks/useQueryParams";
import { useSettingStore } from "./hooks/useSettingStore";
import { useSettingTabStore } from "./hooks/useSettingTabStore";
import { DispatchType } from "./types/IEvents";
import {
	type ColorScheme,
	ColorSchemeType,
	ESettingTab,
	type ISettingTabs,
} from "./types/ISetting";
import Logo from "./ui/components/Logo";
import Title from "./ui/components/Title";
import About from "./ui/setting_tabs/About";
import AddFont from "./ui/setting_tabs/AddFont";
import FontShop from "./ui/setting_tabs/FontShop";
import MyFonts from "./ui/setting_tabs/MyFonts";
import Settings from "./ui/setting_tabs/Settings";
import SettingTabs from "./ui/shell/SettingTabs";
import { handleSettingChange } from "./utils/handleSettingChange";
import { checkForUpdate } from "./utils/update";

function SettingWindow() {
	const {
		theme: colorScheme,
		language,
		fonts,
		defaultFont,
	} = useSettingStore();
	const { t } = useTranslation();
	const queryParams = useQueryParams();
	const { activeTab, setActiveTab } = useSettingTabStore();
	const { setColorScheme } = useMantineColorScheme();

	// check for update when open settings window
	useInit(() => {
		checkForUpdate();
	});

	useEffect(() => {
		// set active tab from url search params, by doing this user can refresh the page and still get the same tab
		if (
			queryParams.has("tab") &&
			Number(queryParams.get("tab")) !== activeTab
		) {
			setActiveTab(Number(queryParams.get("tab")));
		}
	}, [queryParams, activeTab, setActiveTab]);

	const toggleColorScheme = (value?: ColorScheme) => {
		const newTheme =
			value ||
			(colorScheme === ColorSchemeType.Dark
				? ColorSchemeType.Light
				: ColorSchemeType.Dark);

		setColorScheme(newTheme);
		handleSettingChange(DispatchType.ChangeAppTheme, newTheme);
	};

	const settingTabs: ISettingTabs[] = useMemo(
		() => [
			{
				Component: MyFonts,
				title: t("My Fonts", { totalFonts: fonts.length }),
				description: t(
					"Meet your furry friend, a loyal companion who loves to play and cuddle",
				),
				Icon: <IconCat size="1rem" />,
				label: t("My Font"),
				tab: ESettingTab.MyFonts,
			},
			{
				Component: FontShop,
				title: t("Font Shop Total", { totalFonts: defaultFont.length }),
				description: t(
					"Browse wide selection of adorable fonts, find your perfect companion today!",
				),
				Icon: <IconBuildingStore size="1rem" />,
				label: t("Font Shop"),
				tab: ESettingTab.FontShop,
			},
			{
				Component: AddFont,
				title: t("Add Custom Font"),
				description: t(
					"Add your custom font to your computer and watch them bring kawaii cuteness to your digital world!",
				),
				Icon: <IconPaw size="1rem" />,
				label: t("Add Custom Font"),
				tab: ESettingTab.AddFont,
			},
			{
				Component: Settings,
				title: t("Setting Preferences"),
				description: t("Choose what u desire, do what u love"),
				Icon: <IconSettings size="1rem" />,
				label: t("Settings"),
				tab: ESettingTab.Settings,
			},
			{
				Component: About,
				title: t("About"),
				description: t("Know more about ZingFont"),
				Icon: <IconInfoCircle size="1rem" />,
				label: t("About"),
				tab: ESettingTab.About,
			},
		],
		[fonts.length, t, defaultFont.length],
	);
	const CurrentSettingTab = settingTabs[activeTab]?.Component;

	return (
		<>
			<Notifications position={"top-center"} limit={2} />
			<ModalsProvider>
				<AppShell padding={0} navbar={{ width: 80, breakpoint: 0 }}>
					<AppShell.Navbar p="md">
						<Flex
							style={{
								height: "100%",
							}}
							direction={"column"}
							justify={"space-between"}
							align={"center"}
						>
							<Stack justify="center" align={"center"}>
								<Logo />
								<AppShell.Section mt={50}>
									<Stack justify="center" align={"center"} gap={5}>
										<SettingTabs
											activeTab={activeTab}
											settingTabs={settingTabs}
										/>
									</Stack>
								</AppShell.Section>
							</Stack>
							<AppShell.Section>
								<Stack justify="center" align={"center"}>
									<ActionIcon
										variant="default"
										onClick={() => toggleColorScheme()}
										size={30}
									>
										{colorScheme === ColorSchemeType.Dark ? (
											<IconSun size="1rem" />
										) : (
											<IconMoonStars size="1rem" />
										)}
									</ActionIcon>
								</Stack>
							</AppShell.Section>
						</Flex>
					</AppShell.Navbar>
					<AppShell.Main>
						<ScrollArea.Autosize h={"100vh"} key={activeTab}>
							<Box m={"lg"}>
								<Title
									title={settingTabs[activeTab].title}
									description={settingTabs[activeTab].description}
								/>
								<CurrentSettingTab key={activeTab} />
							</Box>
						</ScrollArea.Autosize>
					</AppShell.Main>
				</AppShell>
			</ModalsProvider>
		</>
	);
}

export default memo(SettingWindow);
