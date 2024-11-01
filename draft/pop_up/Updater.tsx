import { Anchor, Box, Text } from "@mantine/core";
import { open } from "@tauri-apps/api/shell";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UpdaterPopupProps } from "../../types/components/type";

function Updater({ shouldUpdate, manifest }: UpdaterPopupProps) {
	const { t } = useTranslation();
	const [markdown, setMarkDown] = useState<string>();

	useEffect(() => {
		const getReleaseNote = async () => {
			const res = await fetch(
				`https://api.github.com/repos/volfadar/ZingFont/releases/latest`,
			);

			if (res.ok) {
				const json = await res.json();
				setMarkDown(json.body);
			}
		};
		getReleaseNote();
	}, []);

	return (
		<>
			<Box>
				<Text display={"inline"}>
					{t("ZingFont v available, do you want to install the update?", {
						version: manifest?.version,
					})}
					<Anchor
						mx={"xs"}
						onClick={() =>
							open(
								`https://github.com/volfadar/tauri-zingfont.git/releases/latest`,
							)
						}
					>
						{t("(release note)")}
					</Anchor>
				</Text>
				<Box mx={"lg"}>
					<Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
				</Box>
			</Box>
		</>
	);
}

export default Updater;
