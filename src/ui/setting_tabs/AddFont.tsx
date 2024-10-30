import {
	Accordion,
	ActionIcon,
	Button,
	Fieldset,
	Group,
	NumberInput,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	IconCheck,
	IconExclamationCircle,
	IconFolderOpen,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import { open } from "@tauri-apps/api/dialog";
import { exists } from "@tauri-apps/api/fs";
import clsx from "clsx";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDefaultFonts } from "../../hooks/useFonts";
import { ButtonVariant, PrimaryColor } from "../../utils";
import { saveCustomFont } from "../../utils/settings";
import classes from "./AddFont.module.css";

interface IFontStates {
	stateName: string;
	start: number;
	end: number;
	startError?: string | null;
	stateNameError?: string | null;
	endError?: string | null;
}

export interface IFontInfo {
	frameSize: number;
	imageSrc: string;
	name: string;
	states: IFontStates[];
	frameSizeError?: string | null;
	imageSrcError?: string | null;
	nameError?: string | null;
}

const defaultStateInfo = {
	stateName: "",
	start: 1,
	end: 1,
	endError: null,
	startError: null,
	stateNameError: null,
};

function AddFont() {
	const { refetch } = useDefaultFonts();
	const [fontInfo, setFontInfo] = useState<IFontInfo>({
		imageSrc: "",
		frameSize: 1,
		name: "",
		states: [structuredClone(defaultStateInfo)],
		nameError: null,
		imageSrcError: null,
		frameSizeError: null,
	});
	const { t } = useTranslation();

	const selectImage = async () => {
		const filePath = (await open({
			multiple: false,
			filters: [
				{
					name: "Image",
					extensions: ["png"],
				},
			],
		})) as string;
		if (filePath) setFontInfo({ ...fontInfo, imageSrc: filePath });
	};

	const addMoreState = () => {
		const newStateArr = fontInfo.states;
		// clone the object otherwise it will use the same reference causing all state to have the same value
		newStateArr.push(structuredClone(defaultStateInfo));
		setFontInfo({ ...fontInfo, states: newStateArr });
	};

	const removeStateAtIndex = (removeAtIndex: number) => {
		if (fontInfo.states.length === 1) return;

		const newStateArr = fontInfo.states;
		newStateArr.splice(removeAtIndex, 1);
		setFontInfo({ ...fontInfo, states: newStateArr });
	};

	const combineStateToObject = () => {
		const states: {
			[key: string]: {
				start: number;
				end: number;
			};
		} = {};
		fontInfo.states.forEach((fontStates) => {
			states[fontStates.stateName] = {
				start: fontStates.start,
				end: fontStates.end,
			};
		});

		return {
			frameSize: fontInfo.frameSize,
			imageSrc: fontInfo.imageSrc,
			name: fontInfo.name,
			states: states,
		};
	};

	/**
	 * function can be refactor down to a shorter function
	 * but I want to keep the code readable and easy to understand
	 */
	const validateCustomFontObject = async () => {
		let isValid = true;
		const tempFontInfo = structuredClone(fontInfo);

		if (!fontInfo.name) {
			tempFontInfo.nameError = t("Font name is required");
			isValid = false;
		} else {
			tempFontInfo.nameError = null;
		}

		if (!fontInfo.imageSrc) {
			fontInfo.imageSrcError = t("Spritesheet path is required");
			isValid = false;
		} else {
			tempFontInfo.imageSrcError = null;
		}

		if (!fontInfo.frameSize) {
			tempFontInfo.frameSizeError = t("Frame size is required");
			isValid = false;
		} else {
			tempFontInfo.frameSizeError = null;
		}

		const imageSrcExist = await exists(fontInfo.imageSrc);
		if (!imageSrcExist) {
			tempFontInfo.imageSrcError = t(
				"Spritesheet path provided does not exist",
			);
			isValid = false;
		} else {
			tempFontInfo.imageSrcError = null;
		}

		for (const state of tempFontInfo.states) {
			if (!state.stateName) {
				state.stateNameError = t("Font state name is required");
				isValid = false;
			} else {
				state.stateNameError = null;
			}

			if (!state.start) {
				state.startError = t("Font state start is required");
				isValid = false;
			} else {
				state.startError = null;
			}

			if (!state.end) {
				state.endError = t("Font state end is required");
				isValid = false;
			} else {
				state.endError = null;
			}

			if (state.start <= 0) {
				state.startError = t("Font start must be greater than 0");
				isValid = false;
			} else {
				state.startError = null;
			}

			if (state.end <= 0) {
				state.endError = t("Font end must be greater than 0");
				isValid = false;
			} else {
				state.endError = null;
			}

			if (state.start > state.end) {
				state.startError = t("Font start must be less than end");
				state.endError = t("Font end must be greater than start");
				isValid = false;
			} else {
				state.startError = null;
				state.endError = null;
			}
		}

		if (!isValid) {
			setFontInfo({ ...tempFontInfo });
		}

		return isValid;
	};

	const FontStates = fontInfo.states.map((fontState, index) => {
		return (
			<Accordion.Item
				value={index.toString()}
				key={index}
				className={clsx({
					[classes.errorBorder]:
						fontState.stateNameError ||
						fontState.startError ||
						fontState.endError,
				})}
			>
				<Accordion.Control>
					{fontState.stateName || t("State")}
				</Accordion.Control>
				<Accordion.Panel>
					<Stack gap={"sm"}>
						<Group grow align={"normal"}>
							<TextInput
								label={t("State name")}
								placeholder={t("State name")}
								error={fontState.stateNameError}
								value={fontState.stateName}
								onChange={(event) => {
									const newStateArr = fontInfo.states;
									newStateArr[index].stateName = event.target.value;
									setFontInfo({ ...fontInfo, states: newStateArr });
								}}
							/>
							{/* start */}
							<NumberInput
								label={t("Start")}
								placeholder={t("Start number")}
								error={fontState.startError}
								min={1}
								value={fontState.start}
								onChange={(value) => {
									const newStateArr = fontInfo.states;
									newStateArr[index].start = Number(value);
									setFontInfo({ ...fontInfo, states: newStateArr });
								}}
							/>
							{/* end */}
							<NumberInput
								label={t("End")}
								placeholder={t("End number")}
								error={fontState.endError}
								min={1}
								value={fontState.end}
								onChange={(value) => {
									const newStateArr = fontInfo.states;
									newStateArr[index].end = Number(value);
									setFontInfo({ ...fontInfo, states: newStateArr });
								}}
							/>
						</Group>
						<Group justify="right">
							<Button
								variant={ButtonVariant}
								color="red"
								leftSection={<IconTrash />}
								disabled={fontInfo.states.length === 1}
								onClick={() => removeStateAtIndex(index)}
							>
								{t("Remove state")}
							</Button>
						</Group>
					</Stack>
				</Accordion.Panel>
			</Accordion.Item>
		);
	});

	return (
		<>
			<Fieldset legend={t("Font information")} variant={"filled"}>
				<Stack>
					<TextInput
						label={t("Font name")}
						placeholder={t("Font name")}
						error={fontInfo.nameError}
						value={fontInfo.name}
						onChange={(event) =>
							setFontInfo({ ...fontInfo, name: event.target.value })
						}
					/>
					<NumberInput
						min={1}
						label={t("Frame size")}
						placeholder={t("Frame size")}
						error={fontInfo.frameSizeError}
						value={fontInfo.frameSize}
						onChange={(value) =>
							setFontInfo({ ...fontInfo, frameSize: Number(value) })
						}
					/>
					<TextInput
						label={t("Spritesheet path")}
						placeholder={t("Spritesheet path")}
						error={fontInfo.imageSrcError}
						value={fontInfo.imageSrc}
						onChange={(event) =>
							setFontInfo({ ...fontInfo, imageSrc: event.target.value })
						}
						rightSection={
							<Tooltip
								label={t("Browse file")}
								color={PrimaryColor}
								style={{
									color: "white",
								}}
								withArrow
							>
								<ActionIcon
									variant="transparent"
									className={clsx(classes.browse)}
								>
									<IconFolderOpen onClick={selectImage} />
								</ActionIcon>
							</Tooltip>
						}
					/>
					<Text size={"sm"}>{t("Font states")}</Text>
					<Accordion variant="contained">{FontStates}</Accordion>
					<Group justify="right">
						<Button
							variant={ButtonVariant}
							leftSection={<IconPlus />}
							onClick={addMoreState}
						>
							{t("Add more state")}
						</Button>
						<Button
							variant={ButtonVariant}
							color={"green"}
							leftSection={<IconCheck />}
							onClick={async () => {
								const canAddFont = await validateCustomFontObject();

								if (!canAddFont) {
									notifications.show({
										message: t(
											"Font cannot be added, try to verify your font information again such as image path, frame size, all state name, start and end frame",
										),
										title: t("Error: Font cannot be added"),
										color: "red",
										icon: <IconExclamationCircle size="1rem" />,
										withBorder: true,
										autoClose: 3000,
									});
									return;
								}

								await saveCustomFont(combineStateToObject());
								refetch();
							}}
						>
							{t("Add Custom Font")}
						</Button>
					</Group>
				</Stack>
			</Fieldset>
		</>
	);
}

export default memo(AddFont);
