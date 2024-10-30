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
	const [petInfo, setFontInfo] = useState<IFontInfo>({
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
		if (filePath) setFontInfo({ ...petInfo, imageSrc: filePath });
	};

	const addMoreState = () => {
		const newStateArr = petInfo.states;
		// clone the object otherwise it will use the same reference causing all state to have the same value
		newStateArr.push(structuredClone(defaultStateInfo));
		setFontInfo({ ...petInfo, states: newStateArr });
	};

	const removeStateAtIndex = (removeAtIndex: number) => {
		if (petInfo.states.length === 1) return;

		const newStateArr = petInfo.states;
		newStateArr.splice(removeAtIndex, 1);
		setFontInfo({ ...petInfo, states: newStateArr });
	};

	const combineStateToObject = () => {
		const states: {
			[key: string]: {
				start: number;
				end: number;
			};
		} = {};
		petInfo.states.forEach((petStates) => {
			states[petStates.stateName] = {
				start: petStates.start,
				end: petStates.end,
			};
		});

		return {
			frameSize: petInfo.frameSize,
			imageSrc: petInfo.imageSrc,
			name: petInfo.name,
			states: states,
		};
	};

	/**
	 * function can be refactor down to a shorter function
	 * but I want to keep the code readable and easy to understand
	 */
	const validateCustomFontObject = async () => {
		let isValid = true;
		const tempFontInfo = structuredClone(petInfo);

		if (!petInfo.name) {
			tempFontInfo.nameError = t("Font name is required");
			isValid = false;
		} else {
			tempFontInfo.nameError = null;
		}

		if (!petInfo.imageSrc) {
			petInfo.imageSrcError = t("Spritesheet path is required");
			isValid = false;
		} else {
			tempFontInfo.imageSrcError = null;
		}

		if (!petInfo.frameSize) {
			tempFontInfo.frameSizeError = t("Frame size is required");
			isValid = false;
		} else {
			tempFontInfo.frameSizeError = null;
		}

		const imageSrcExist = await exists(petInfo.imageSrc);
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

	const FontStates = petInfo.states.map((petState, index) => {
		return (
			<Accordion.Item
				value={index.toString()}
				key={index}
				className={clsx({
					[classes.errorBorder]:
						petState.stateNameError || petState.startError || petState.endError,
				})}
			>
				<Accordion.Control>
					{petState.stateName || t("State")}
				</Accordion.Control>
				<Accordion.Panel>
					<Stack gap={"sm"}>
						<Group grow align={"normal"}>
							<TextInput
								label={t("State name")}
								placeholder={t("State name")}
								error={petState.stateNameError}
								value={petState.stateName}
								onChange={(event) => {
									const newStateArr = petInfo.states;
									newStateArr[index].stateName = event.target.value;
									setFontInfo({ ...petInfo, states: newStateArr });
								}}
							/>
							{/* start */}
							<NumberInput
								label={t("Start")}
								placeholder={t("Start number")}
								error={petState.startError}
								min={1}
								value={petState.start}
								onChange={(value) => {
									const newStateArr = petInfo.states;
									newStateArr[index].start = Number(value);
									setFontInfo({ ...petInfo, states: newStateArr });
								}}
							/>
							{/* end */}
							<NumberInput
								label={t("End")}
								placeholder={t("End number")}
								error={petState.endError}
								min={1}
								value={petState.end}
								onChange={(value) => {
									const newStateArr = petInfo.states;
									newStateArr[index].end = Number(value);
									setFontInfo({ ...petInfo, states: newStateArr });
								}}
							/>
						</Group>
						<Group justify="right">
							<Button
								variant={ButtonVariant}
								color="red"
								leftSection={<IconTrash />}
								disabled={petInfo.states.length === 1}
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
						error={petInfo.nameError}
						value={petInfo.name}
						onChange={(event) =>
							setFontInfo({ ...petInfo, name: event.target.value })
						}
					/>
					<NumberInput
						min={1}
						label={t("Frame size")}
						placeholder={t("Frame size")}
						error={petInfo.frameSizeError}
						value={petInfo.frameSize}
						onChange={(value) =>
							setFontInfo({ ...petInfo, frameSize: Number(value) })
						}
					/>
					<TextInput
						label={t("Spritesheet path")}
						placeholder={t("Spritesheet path")}
						error={petInfo.imageSrcError}
						value={petInfo.imageSrc}
						onChange={(event) =>
							setFontInfo({ ...petInfo, imageSrc: event.target.value })
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
