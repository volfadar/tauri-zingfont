import Phaser from "phaser";
import { memo, useEffect, useRef } from "react";
import { Font } from "../../scenes/Font";
import type { PhaserCanvasProps } from "../../types/components/type";
import { CanvasSize } from "../../utils";

function PhaserCanvas({ font, playState }: PhaserCanvasProps) {
	const phaserDom = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (phaserDom.current === null) return;
		const phaserConfig: Phaser.Types.Core.GameConfig = {
			type: Phaser.CANVAS,
			parent: phaserDom.current,
			transparent: true,
			roundPixels: true,
			antialias: true,
			scale: {
				// mode: Phaser.Scale.ScaleModes.RESIZE,
				width: CanvasSize,
				height: CanvasSize,
			},
			physics: {
				default: "arcade",
				arcade: {
					debug: false,
					gravity: { y: 200, x: 0 },
				},
			},
			fps: {
				target: 30,
				min: 30,
				smoothStep: true,
			},
			scene: [Font],
			audio: {
				noAudio: true,
			},
			callbacks: {
				preBoot: (game) => {
					game.registry.set("spriteConfig", font);
					game.registry.set("playState", playState);
				},
			},
		};

		const game = new Phaser.Game(phaserConfig);

		return () => {
			game.destroy(true);
			// reset the dom
			if (phaserDom.current !== null) phaserDom.current.innerHTML = "";
		};
	}, [font, playState]);

	return (
		<div
			style={{
				// disable pointer events so that the canvas can be scrolled when the mouse is over it
				pointerEvents: "none",
			}}
			ref={phaserDom}
			key={font.id ?? font.name}
		/>
	);
}

export default memo(PhaserCanvas);
