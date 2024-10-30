import { Box, Button, Group, NativeSelect, Title } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { memo, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useFontStateStore } from "../../hooks/useFontStateStore";
import { SpriteType } from "../../types/ISpriteConfig";
import { FontCardType, type IFontCardProps } from "../../types/components/type";
import { ButtonVariant, CanvasSize, PrimaryColor } from "../../utils";
import classes from "./FontCard.module.css";
import PhaserCanvas from "./PhaserCanvas";

function FontCard({
	btnLabel,
	btnLabelCustom,
	font,
	btnFunction,
	btnFunctionCustom,
	type,
}: IFontCardProps) {
	const { petStates, storeDictFontStates } = useFontStateStore();
	const availableStates =
		petStates[font.name] ?? Object.keys(font.states).map((state) => state);
	const randomState =
		availableStates[Math.floor(Math.random() * availableStates.length)];
	const [playState, setPlayState] = useState<string>(randomState);
	const { ref, inView } = useInView();
	const isCustomFont =
		type === FontCardType.Add && font.type === SpriteType.CUSTOM;

	// save font to memoization so that we can use it later to save some resource
	useEffect(() => {
		if (!Object.prototype.hasOwnProperty.call(petStates, font.name)) {
			storeDictFontStates(font.name, availableStates);
		}
	}, [availableStates, font.name, petStates, storeDictFontStates]);

	return (
		<>
			{/* if the font is currently in user viewport, show it, otherwise destroy its dom because it take a lot of resource */}
			<Box
				id={`petCard-id-${font.id ?? font.customId}`}
				ref={ref}
				className={classes.boxWrapper}
				key={font.id ?? font.name}
			>
				{inView ? (
					<Box>
						<PhaserCanvas font={font} playState={playState} key={font.id} />
						<Box p={"lg"}>
							<Title order={4} className={classes.title}>
								{font.name}
							</Title>
							{/* for now use native select because select in mantine 7 is very slow, let see until further update */}
							{/* <Select
                                allowDeselect={false}
                                checkIconPosition={"right"}
                                my={"md"}
                                maxDropdownHeight={210}
                                placeholder="Pick one"
                                defaultValue={playState}
                                onChange={setPlayState as any}
                                pointer
                                key={font.id ?? font.name}
                                data={availableStates}
                            /> */}
							<NativeSelect
								my={"md"}
								defaultValue={playState}
								onChange={(event) => setPlayState(event.currentTarget.value)}
								key={font.id ?? font.name}
								data={availableStates}
							/>
							<Group>
								<Button
									variant={ButtonVariant}
									fullWidth
									onClick={btnFunction}
									color={type === FontCardType.Remove ? "red" : PrimaryColor}
									leftSection={
										type === FontCardType.Add ? <IconPlus /> : <IconTrash />
									}
								>
									{btnLabel}
								</Button>
								{isCustomFont && (
									<Button
										variant={ButtonVariant}
										fullWidth
										onClick={btnFunctionCustom}
										color={"red"}
										leftSection={<IconTrash />}
									>
										{btnLabelCustom}
									</Button>
								)}
							</Group>
						</Box>
					</Box>
				) : (
					<Box
						style={{
							height: CanvasSize,
							width: CanvasSize,
						}}
					/>
				)}
			</Box>
		</>
	);
}

export default memo(FontCard);
