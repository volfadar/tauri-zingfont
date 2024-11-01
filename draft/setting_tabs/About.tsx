import { Anchor, Avatar, Button, Flex, Loader, Text } from "@mantine/core";
import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/api/shell";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonVariant } from "../../utils";
import { checkForUpdate } from "../../utils/update";

function About() {
	const { t } = useTranslation();
	const [appVersion, setAppVersion] = useState(".....");
	const [checkingForUpdate, setCheckingForUpdate] = useState(false);
	const [isLatestVersion, setIsLatestVersion] = useState(false);

	const checkUpdate = useCallback(async () => {
		if (!checkingForUpdate) {
			setCheckingForUpdate(true);
			const hasUpdate = await checkForUpdate();
			hasUpdate ? setIsLatestVersion(false) : setIsLatestVersion(true);
			setCheckingForUpdate(false);
		}
	}, [checkingForUpdate]);

	useEffect(() => {
		getVersion().then((version) => {
			setAppVersion(version);
		});
		checkUpdate();

		return () => {
			setAppVersion(".....");
			setCheckingForUpdate(false);
			setIsLatestVersion(false);
		};
	}, [checkUpdate]);

	const titleAndLinks = useMemo(
		() => [
			{
				title: t("Developed by:"),
				link: {
					url: "https://github.com/volfadar",
					label: t("@Seakmeng"),
				},
			},
			{
				title: t("Source code:"),
				link: {
					url: "https://github.com/volfadar/tauri-zingfont.git",
					label: t("@volfadar/tauri-zingfont"),
				},
			},
			{
				title: t("Report a bug:"),
				link: {
					url: "https://github.com/volfadar/tauri-zingfont.git/issues",
					label: t("@volfadar/tauri-zingfont/issues"),
				},
			},
			{
				title: t("Community: "),
				link: {
					url: "https://github.com/volfadar/tauri-zingfont.git/discussions",
					label: t("@volfadar/tauri-zingfont/discussions"),
				},
			},
			{
				title: t("Buy me a coffee:"),
				link: {
					url: "https://www.buymeacoffee.com/seakmeng",
					label: t("BuyMeACoffee/@Seakmeng"),
				},
			},
		],
		[t],
	);

	return (
		<Flex align={"center"} justify={"center"} direction={"column"} gap={"md"}>
			<Avatar src="/media/icon.png" alt="ZingFont" w={128} h={128} />
			<Text fw={700}>ZingFont</Text>
			<Text display={"flex"}>
				{t("Version", { version: appVersion })}
				<Anchor
					mx={"xs"}
					onClick={() =>
						open(
							`https://github.com/volfadar/tauri-zingfont.git/releases/tag/v${appVersion}`,
						)
					}
				>
					{t("(release note)")}
				</Anchor>
			</Text>
			{checkingForUpdate && (
				<Flex align={"center"} justify={"center"} gap={"xs"}>
					<Loader />
					<Text color="dimmed">{t("Checking for updates")}</Text>
				</Flex>
			)}
			{isLatestVersion
				? !checkingForUpdate && (
						<Text color="dimmed">
							{t("You have the latest version", { lastCheck: "" })}
						</Text>
					)
				: !checkingForUpdate && (
						<Text color="dimmed">
							{t("There is a new version available", { lastCheck: "" })}
						</Text>
					)}
			<Button variant={ButtonVariant} onClick={checkUpdate}>
				{t("Check for updates")}
			</Button>
			{titleAndLinks.map((item, index) => (
				<Text key={`titleAndLinks-${index}`} display={"flex"}>
					{item.title}
					<Anchor mx={"xs"} onClick={() => open(item.link.url)}>
						{item.link.label}
					</Anchor>
				</Text>
			))}
		</Flex>
	);
}

export default memo(About);
