import { listen } from "@tauri-apps/api/event";
import { error, info } from "tauri-plugin-log-api";
import defaultSettings from "../../src-tauri/src/app/default/settings.json";
import { useSettingStore } from "../hooks/useSettingStore";
import {
	DispatchType,
	EventType,
	type TRenderEventListener,
} from "../types/IEvents";
import {
	Direction,
	Ease,
	type ISwitchStateOptions,
	type IWorldBounding,
} from "../types/IFont";
import type { ISpriteConfig } from "../types/ISpriteConfig";
import { ConfigManager, InputManager } from "./manager";

interface Font extends Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
	direction?: Direction;
	availableStates: string[];
	canPlayRandomState: boolean;
	canRandomFlip: boolean;
	id: string;
}

export default class Fonts extends Phaser.Scene {
	private fonts: Font[] = [];
	private isFlipped = false;
	private frameCount = 0;
	// use this array to store index of font that is currently climb and crawl
	private petClimbAndCrawlIndex: number[] = [];

	private configManager: ConfigManager;
	// input manager to handle mouse, toggle cursor events to ignore cursor events when mouse is over font
	private inputManager: InputManager;

	// app settings
	private allowFontInteraction: boolean;
	private allowFontAboveTaskbar: boolean;
	private allowOverrideFontScale: boolean;
	private petScale: number;
	private allowFontClimbing: boolean;

	private readonly FORBIDDEN_RAND_STATE: string[] = [
		"fall",
		"climb",
		"drag",
		"crawl",
		"drag",
		"bounce",
		"jump",
	];
	private readonly FRAME_RATE: number = 9;
	private readonly UPDATE_DELAY: number = 1000 / this.FRAME_RATE;
	private readonly PET_MOVE_VELOCITY: number = this.FRAME_RATE * 6;
	private readonly PET_MOVE_ACCELERATION: number = this.PET_MOVE_VELOCITY * 2;
	private readonly TWEEN_ACCELERATION: number = this.FRAME_RATE * 1.1;
	private readonly RAND_STATE_DELAY: number = 3000;
	private readonly FLIP_DELAY: number = 5000;

	constructor() {
		super({ key: "Fonts" });

		// Initialize other settings without relying on this.input
		this.allowFontInteraction =
			useSettingStore.getState().allowFontInteraction ??
			defaultSettings.allowFontInteraction;
		this.allowFontAboveTaskbar =
			useSettingStore.getState().allowFontAboveTaskbar ??
			defaultSettings.allowFontAboveTaskbar;
		this.allowOverrideFontScale =
			useSettingStore.getState().allowOverrideFontScale ??
			defaultSettings.allowOverrideFontScale;
		this.petScale =
			useSettingStore.getState().petScale ?? defaultSettings.petScale;
		this.allowFontClimbing =
			useSettingStore.getState().allowFontClimbing ??
			defaultSettings.allowFontClimbing;

		this.configManager = new ConfigManager({
			FRAME_RATE: this.FRAME_RATE,
		});
		this.inputManager = new InputManager();
	}

	preload(): void {
		this.configManager.setConfigManager({
			load: this.load,
			textures: this.textures,
			anims: this.anims,
		});

		this.inputManager.setInputManager({ input: this.input });
		const spriteConfig = this.game.registry.get("spriteConfig");
		this.configManager.setSpriteConfig(spriteConfig);
		this.configManager.loadAllSpriteSheet();
	}

	create(): void {
		this.inputManager.turnOnIgnoreCursorEvents();
		this.physics.world.setBoundsCollision(true, true, true, true);
		this.updateFontAboveTaskbar();

		// check all loaded sprite (debug only)
		// console.log(this.textures.list);

		let i = 0;
		// create fonts
		for (const sprite of this.configManager.getSpriteConfig()) {
			this.addFont(sprite, i);
			i++;
		}

		// register event
		this.input.on(
			"drag",
			(pointer: any, font: Font, dragX: number, dragY: number) => {
				font.x = dragX;
				font.y = dragY;

				if (
					font.anims &&
					font.anims.getName() !== this.configManager.getStateName("drag", font)
				) {
					this.switchState(font, "drag");
				}

				// disable world bounds when dragging so that font can go beyond screen
				// @ts-ignore
				if (font.body!.enable) font.body!.enable = false;

				// if current font x is greater than drag start x, flip the font to the right
				if (font.x > font.input!.dragStartX) {
					if (this.isFlipped) {
						this.toggleFlipX(font);
						this.isFlipped = false;
					}
				} else {
					if (!this.isFlipped) {
						this.toggleFlipX(font);
						this.isFlipped = true;
					}
				}
			},
		);

		this.input.on("dragend", (pointer: any, font: Font) => {
			// add tween effect when drag end for smooth throw effect
			this.tweens.add({
				targets: font,
				// x and y is the position of the font when drag end
				x: font.x + pointer.velocity.x * this.TWEEN_ACCELERATION,
				y: font.y + pointer.velocity.y * this.TWEEN_ACCELERATION,
				duration: 600,
				ease: Ease.QuartEaseOut,
				onComplete: () => {
					// enable collision when dragging end so that collision will work again and font go back to the screen
					if (!font.body!.enable) {
						font.body!.enable = true;

						// not sure why when enabling body, velocity become 0, and need to take a while to update velocity
						setTimeout(() => {
							switch (font.anims.getName()) {
								case this.configManager.getStateName("climb", font):
									this.updateDirection(font, Direction.UP);
									break;
								case this.configManager.getStateName("crawl", font):
									this.updateDirection(
										font,
										font.scaleX === -1
											? Direction.UPSIDELEFT
											: Direction.UPSIDERIGHT,
									);
									break;
								default:
									return;
							}
						}, 50);
					}
				},
			});

			this.petBeyondScreenSwitchClimb(font, {
				up: this.getFontBoundTop(font),
				down: this.getFontBoundDown(font),
				left: this.getFontBoundLeft(font),
				right: this.getFontBoundRight(font),
			});
		});

		this.physics.world.on(
			"worldbounds",
			(
				body: Phaser.Physics.Arcade.Body,
				up: boolean,
				down: boolean,
				left: boolean,
				right: boolean,
			) => {
				const font = body.gameObject as Font;
				// if crawl to world bounds, we make the font jump or spawn on the ground
				if (
					font.anims &&
					font.anims.getName() ===
						this.configManager.getStateName("crawl", font)
				) {
					if (left || right) {
						this.petJumpOrPlayRandomState(font);
					}
					return;
				}

				if (up) {
					if (!this.allowFontClimbing) {
						this.petJumpOrPlayRandomState(font);
						return;
					}

					if (font.availableStates.includes("crawl")) {
						this.switchState(font, "crawl");
						return;
					}
					this.petJumpOrPlayRandomState(font);
				} else if (down) {
					this.switchStateAfterFontJump(font);
					this.petOnTheGroundPlayRandomState(font);
				}

				/*
				 * this will check on the ground and mid air if font is beyond screen
				 * and change font state accordingly
				 */
				this.petBeyondScreenSwitchClimb(font, {
					up: up,
					down: down,
					left: left,
					right: right,
				});
			},
		);

		// listen to setting change from setting window and update settings
		listen<any>(
			EventType.SettingWindowToFontOverlay,
			(event: TRenderEventListener) => {
				switch (event.payload.dispatchType) {
					case DispatchType.SwitchAllowFontInteraction:
						this.allowFontInteraction = event.payload.value as boolean;
						break;
					case DispatchType.SwitchFontAboveTaskbar:
						this.allowFontAboveTaskbar = event.payload.value as boolean;
						this.updateFontAboveTaskbar();

						// when the user switch from font above taskbar to not above taskbar, there will be a little space for font, we force font to jump or play random state
						if (!this.allowFontAboveTaskbar) {
							this.fonts.forEach((font) => {
								this.petJumpOrPlayRandomState(font);
							});
						}

						break;
					case DispatchType.AddFont:
						this.addFont(
							event.payload!.value as ISpriteConfig,
							this.fonts.length,
						);
						break;
					case DispatchType.RemoveFont:
						this.removeFont(event.payload.value as string);
						break;
					case DispatchType.OverrideFontScale:
						this.allowOverrideFontScale = event.payload.value as boolean;
						this.allowOverrideFontScale
							? this.scaleAllFonts(this.petScale)
							: this.scaleAllFonts(defaultSettings.petScale);
						break;
					case DispatchType.SwitchAllowFontClimbing:
						this.allowFontClimbing = event.payload.value as boolean;

						// when the user switch from font climb to not climb, we force font to jump or play random state
						if (!this.allowFontClimbing) {
							this.fonts.forEach((font) => {
								this.petJumpOrPlayRandomState(font);
							});
						}
						break;
					case DispatchType.ChangeFontScale:
						this.petScale = event.payload.value as number;
						this.scaleAllFonts(this.petScale);
						break;
					default:
						break;
				}
			},
		);

		info("Fonts scene loaded");
	}

	update(time: number, delta: number): void {
		this.frameCount += delta;

		if (this.frameCount >= this.UPDATE_DELAY) {
			this.frameCount = 0;
			if (this.allowFontInteraction) {
				this.inputManager.checkIsMouseInOnFont();
			}

			this.randomJumpIfFontClimbAndCrawl();
		}
	}

	addFont(sprite: ISpriteConfig, index: number): void {
		this.configManager.registerSpriteStateAnimation(sprite);

		const randomX = Phaser.Math.Between(
			100,
			this.physics.world.bounds.width - 100,
		);
		// make the font jump from the top of the screen
		const petY = 0 + this.configManager.getFrameSize(sprite).frameHeight;
		this.fonts[index] = this.physics.add
			.sprite(randomX, petY, sprite.name)
			.setInteractive({
				draggable: true,
				pixelPerfect: true,
			}) as Font;

		this.allowOverrideFontScale
			? this.scaleFont(this.fonts[index], this.petScale)
			: this.scaleFont(this.fonts[index], defaultSettings.petScale);

		this.fonts[index].setCollideWorldBounds(true, 0, 0, true);

		// store available states to font (it actual name, not modified name)
		this.fonts[index].availableStates = Object.keys(sprite.states);
		this.fonts[index].canPlayRandomState = true;
		this.fonts[index].canRandomFlip = true;
		this.fonts[index].id = sprite.id as string;

		this.petJumpOrPlayRandomState(this.fonts[index]);
	}

	removeFont(petId: string): void {
		this.fonts = this.fonts.filter((font: Font, index: number) => {
			if (font.id === petId) {
				font.destroy();

				// get font that use the same texture as the font that is destroyed
				const petsWithSameTexture = this.fonts.filter(
					(font: Font) => font.texture.key === this.fonts[index].texture.key,
				);

				// remove texture if there is only one font that use the texture because we don't need it anymore
				if (petsWithSameTexture.length === 1) {
					this.textures.remove(font.texture.key);
				}

				// remove index from petClimbAndCrawlIndex if it exist because the font is destroyed
				if (this.petClimbAndCrawlIndex.includes(index)) {
					this.petClimbAndCrawlIndex = this.petClimbAndCrawlIndex.filter(
						(i) => i !== index,
					);
				}
				return false;
			}
			return true;
		});
	}

	updateDirection(font: Font, direction: Direction): void {
		font.direction = direction;
		this.updateMovement(font);
	}

	updateStateDirection(font: Font, state: string): void {
		let direction = Direction.UNKNOWN;

		switch (state) {
			case "walk":
				// if font.scaleX is negative, it means font is facing left, so we set direction to left, else right
				direction = font.scaleX < 0 ? Direction.LEFT : Direction.RIGHT;
				break;
			case "jump":
				// feel like jump state is opposite of walk so every jump, i flip the font horizontally :)
				this.toggleFlipX(font);
				direction = Direction.DOWN;
				break;
			case "climb":
				direction = Direction.UP;
				break;
			case "crawl":
				if (font?.scaleX > 0) {
					direction = Direction.UPSIDELEFT;
				} else {
					direction = Direction.UPSIDERIGHT;
				}
				break;
			default:
				direction = Direction.UNKNOWN;
				break;
		}

		this.updateDirection(font, direction);
	}

	// this function will be called every time we update the font direction using updateDirection
	updateMovement(font: Font): void {
		switch (font.direction) {
			case Direction.RIGHT:
				font.setVelocity(this.PET_MOVE_VELOCITY, 0);
				font.setAcceleration(0);
				this.setFontLookToTheLeft(font, false);
				break;
			case Direction.LEFT:
				font.setVelocity(-this.PET_MOVE_VELOCITY, 0);
				font.setAcceleration(0);
				this.setFontLookToTheLeft(font, true);
				break;
			case Direction.UP:
				font.setVelocity(0, -this.PET_MOVE_VELOCITY);
				font.setAcceleration(0);
				break;
			case Direction.DOWN:
				font.setVelocity(0, this.PET_MOVE_VELOCITY);
				font.setAcceleration(0, this.PET_MOVE_ACCELERATION);
				break;
			case Direction.UPSIDELEFT:
				font.setVelocity(-this.PET_MOVE_VELOCITY);
				font.setAcceleration(0);
				this.setFontLookToTheLeft(font, true);
				break;
			case Direction.UPSIDERIGHT:
				font.setVelocity(this.PET_MOVE_VELOCITY, -this.PET_MOVE_VELOCITY);
				font.setAcceleration(0);
				this.setFontLookToTheLeft(font, false);
				break;
			case Direction.UNKNOWN:
				font.setVelocity(0);
				font.setAcceleration(0);
				break;
			default:
				font.setVelocity(0);
				font.setAcceleration(0);
				break;
		}

		// if font is going up, we disable gravity, if font is going down, we enable gravity
		const isMovingUp = [
			Direction.UP,
			Direction.UPSIDELEFT,
			Direction.UPSIDERIGHT,
		].includes(font.direction as Direction);

		// Set the gravity according to the direction
		// @ts-ignore
		font.body!.setAllowGravity(!isMovingUp);

		// Set the horizontal velocityX to zero if the direction is up
		if (font.direction === Direction.UP) {
			font.setVelocityX(0);
		}
	}

	switchState(
		font: Font,
		state: string,
		options: ISwitchStateOptions = {
			repeat: -1,
			delay: 0,
			repeatDelay: 0,
		},
	): void {
		try {
			// when font is destroyed, font.anims will be undefined, there is a chance that this function get called because of setTimeout
			if (!font.anims) return;

			// prevent font from playing crawl and climb state if allowFontClimbing is false
			if (!this.allowFontClimbing) {
				if (state === "climb" || state === "crawl") return;
			}

			const animationKey = this.configManager.getStateName(state, font);
			// if current state is the same as the new state, do nothing
			if (font.anims && font.anims.getName() === animationKey) return;
			if (!font.availableStates.includes(state)) return;

			font.anims.play({
				key: animationKey,
				repeat: options.repeat,
				delay: options.delay,
				repeatDelay: options.repeatDelay,
			});

			if (state === "climb" || state === "crawl") {
				this.petClimbAndCrawlIndex.push(this.fonts.indexOf(font));
			} else {
				this.petClimbAndCrawlIndex = this.petClimbAndCrawlIndex.filter(
					(index) => index !== this.fonts.indexOf(font),
				);
			}

			this.updateStateDirection(font, state);
		} catch (err: any) {
			// error could happen when trying to get name
			error(err);
		}
	}

	// if lookToTheLeft is true, font will look to the left, if false, font will look to the right
	setFontLookToTheLeft(font: Font, lookToTheLeft: boolean): void {
		if (lookToTheLeft) {
			if (font.scaleX > 0) {
				this.toggleFlipX(font);
			}
			return;
		}

		if (font.scaleX < 0) {
			this.toggleFlipX(font);
		}
	}

	scaleFont(font: Font, scaleValue: number): void {
		const scaleX = font.scaleX > 0 ? scaleValue : -scaleValue;
		const scaleY = font.scaleY > 0 ? scaleValue : -scaleValue;
		font.setScale(scaleX, scaleY);
	}

	scaleAllFonts(scaleValue: number): void {
		this.fonts.forEach((font) => {
			this.scaleFont(font, scaleValue);

			// force font to jump or play random state when scale change
			this.petJumpOrPlayRandomState(font);
		});
	}

	toggleFlipX(font: Font): void {
		/*
		 * using scale because flipX doesn't flip the hitbox
		 * so i have to flip the hitbox manually
		 * Note: scaleX negative (- value) = direction left, scaleX positive (+ value) = direction right
		 */
		// if hitbox is on the right, flip to the left
		font.scaleX > 0 ? font.setOffset(font.width, 0) : font.setOffset(0, 0);
		font.setScale(font.scaleX * -1, font.scaleY);
	}

	toggleFlipXThenUpdateDirection(font: Font): void {
		this.toggleFlipX(font);

		switch (font.direction) {
			case Direction.RIGHT:
				this.updateDirection(font, Direction.LEFT);
				break;
			case Direction.LEFT:
				this.updateDirection(font, Direction.RIGHT);
				break;
			case Direction.UPSIDELEFT:
				this.updateDirection(font, Direction.UPSIDERIGHT);
				break;
			case Direction.UPSIDERIGHT:
				this.updateDirection(font, Direction.UPSIDELEFT);
				break;
			default:
				break;
		}
	}

	getOneRandomState(font: Font): string {
		let randomStateIndex: number;

		do {
			randomStateIndex = Phaser.Math.Between(
				0,
				font.availableStates.length - 1,
			);
		} while (
			this.FORBIDDEN_RAND_STATE.includes(font.availableStates[randomStateIndex])
		);

		return font.availableStates[randomStateIndex];
	}

	getOneRandomStateByFont(font: Font): string {
		return this.getOneRandomState(font);
	}

	playRandomState(font: Font): void {
		if (!font.canPlayRandomState) return;

		this.switchState(font, this.getOneRandomState(font));
		font.canPlayRandomState = false;

		// add delay to prevent spamming random state too fast
		setTimeout(() => {
			font.canPlayRandomState = true;
		}, this.RAND_STATE_DELAY);
	}

	// this function is for when font jump to the ground, it will call every time font hit the ground
	switchStateAfterFontJump(font: Font): void {
		if (!font) return;
		if (
			font.anims &&
			font.anims.getName() !== this.configManager.getStateName("jump", font)
		)
			return;

		if (font.availableStates.includes("fall")) {
			this.switchState(font, "fall", {
				repeat: 0,
			});

			// after fall animation complete, we play random state
			font.canPlayRandomState = false;
			font.on("animationcomplete", () => {
				font.canPlayRandomState = true;
				this.playRandomState(font);
			});

			return;
		}
		this.playRandomState(font);
	}

	getFontGroundPosition(font: Font): number {
		return (
			this.physics.world.bounds.height -
			font.height * Math.abs(font.scaleY) * font.originY
		);
	}

	getFontTopPosition(font: Font): number {
		return font.height * Math.abs(font.scaleY) * font.originY;
	}

	getFontLeftPosition(font: Font): number {
		return font.width * Math.abs(font.scaleX) * font.originX;
	}

	getFontRightPosition(font: Font): number {
		return (
			this.physics.world.bounds.width -
			font.width * Math.abs(font.scaleX) * font.originX
		);
	}

	getFontBoundDown(font: Font): boolean {
		// we have to check * with scaleY because sometimes user scale the font
		return font.y >= this.getFontGroundPosition(font);
	}

	getFontBoundLeft(font: Font): boolean {
		return font.x <= this.getFontLeftPosition(font);
	}

	getFontBoundRight(font: Font): boolean {
		return font.x >= this.getFontRightPosition(font);
	}

	getFontBoundTop(font: Font): boolean {
		return font.y <= this.getFontTopPosition(font);
	}

	updateFontAboveTaskbar(): void {
		if (this.allowFontAboveTaskbar) {
			// get taskbar height
			const taskbarHeight = window.screen.height - window.screen.availHeight;

			// update world bounds to include task bar
			this.physics.world.setBounds(
				0,
				0,
				window.screen.width,
				window.screen.height - taskbarHeight,
			);
			return;
		}

		this.physics.world.setBounds(
			0,
			0,
			window.screen.width,
			window.screen.height,
		);
	}

	petJumpOrPlayRandomState(font: Font): void {
		if (!font) return;

		if (font.availableStates.includes("jump")) {
			this.switchState(font, "jump");
			return;
		}

		this.switchState(font, this.getOneRandomState(font));
	}

	petOnTheGroundPlayRandomState(font: Font): void {
		if (!font) {
			return;
		}

		switch (font.anims.getName()) {
			case this.configManager.getStateName("climb", font):
				return;
			case this.configManager.getStateName("crawl", font):
				return;
			case this.configManager.getStateName("drag", font):
				return;
			case this.configManager.getStateName("jump", font):
				return;
		}

		const random = Phaser.Math.Between(0, 2000);
		if (
			font.anims &&
			font.anims.getName() === this.configManager.getStateName("walk", font)
		) {
			if (random >= 0 && random <= 5) {
				this.switchState(font, "idle");
				setTimeout(
					() => {
						if (
							font.anims &&
							font.anims.getName() !==
								this.configManager.getStateName("idle", font)
						)
							return;
						this.switchState(font, "walk");
					},
					Phaser.Math.Between(3000, 6000),
				);
				return;
			}
		} else {
			// enhance random state if font is not walk
			if (random >= 777 && random <= 800) {
				this.playRandomState(font);
				return;
			}
		}

		// just some random number to play random state
		if (random >= 888 && random <= 890) {
			// allow random flip only after font flipped "FLIP_DELAY" time
			if (font.canRandomFlip) {
				this.toggleFlipXThenUpdateDirection(font);
				font.canRandomFlip = false;

				// add delay to prevent spamming font flip too fast
				setTimeout(() => {
					font.canRandomFlip = true;
				}, this.FLIP_DELAY);
			}
		} else if (random >= 777 && random <= 780) {
			this.playRandomState(font);
		} else if (random >= 170 && random <= 175) {
			this.switchState(font, "walk");
		}
	}

	randomJumpIfFontClimbAndCrawl(): void {
		if (this.petClimbAndCrawlIndex.length === 0) return;

		for (const index of this.petClimbAndCrawlIndex) {
			const font = this.fonts[index];
			if (!font) continue;

			switch (font.anims.getName()) {
				case this.configManager.getStateName("drag", font):
					continue;
				case this.configManager.getStateName("jump", font):
					continue;
			}

			const random = Phaser.Math.Between(0, 500);

			if (random === 78) {
				let newFontx = font.x;
				// if font climb, I want the font to have some opposite x direction when jump
				if (
					font.anims &&
					font.anims.getName() ===
						this.configManager.getStateName("climb", font)
				) {
					// if font.scaleX is negative, it means font is facing left, vice versa
					newFontx =
						font.scaleX < 0
							? Phaser.Math.Between(font.x, 500)
							: Phaser.Math.Between(
									font.x,
									this.physics.world.bounds.width - 500,
								);
				}

				// disable body to prevent shaking when jump
				if (font.body!.enable) font.body!.enable = false;
				this.switchState(font, "jump");
				// use tween animation to make jump more smooth
				this.tweens.add({
					targets: font,
					x: newFontx,
					y: this.getFontGroundPosition(font),
					duration: 3000,
					ease: Ease.QuadEaseOut,
					onComplete: () => {
						if (!font.body!.enable) {
							font.body!.enable = true;
							this.switchStateAfterFontJump(font);
						}
					},
				});
				return;
			}

			// add random pause when climb
			if (random >= 0 && random <= 5) {
				if (
					font.anims &&
					font.anims.getName() ===
						this.configManager.getStateName("climb", font)
				) {
					font.anims.pause();
					this.updateDirection(font, Direction.UNKNOWN);
					// @ts-ignore
					font.body!.allowGravity = false;
					setTimeout(
						() => {
							if (font.anims && !font.anims.isPlaying) {
								font.anims.resume();
								this.updateDirection(font, Direction.UP);
							}
						},
						Phaser.Math.Between(3000, 6000),
					);
					return;
				}

				if (
					font.anims &&
					font.anims.getName() ===
						this.configManager.getStateName("crawl", font)
				) {
					// add random pause when crawl
					font.anims.pause();
					this.updateDirection(font, Direction.UNKNOWN);
					// @ts-ignore
					font.body!.allowGravity = false;
					setTimeout(
						() => {
							if (font.anims && !font.anims.isPlaying) {
								font.anims.resume();
								// if font.scaleX is negative, it means font is facing up side left, vice versa
								this.updateDirection(
									font,
									font.scaleX < 0
										? Direction.UPSIDELEFT
										: Direction.UPSIDERIGHT,
								);
							}
						},
						Phaser.Math.Between(3000, 6000),
					);
					return;
				}
			}
		}
	}

	petBeyondScreenSwitchClimb(font: Font, worldBounding: IWorldBounding): void {
		if (!font) return;

		// if font is climb and crawl, we don't want to switch state again
		switch (font.anims.getName()) {
			case this.configManager.getStateName("climb", font):
				return;
			case this.configManager.getStateName("crawl", font):
				return;
		}

		// ? debug only
		// font.availableStates = font.availableStates.filter(state => state !== 'climb');

		if (worldBounding.left || worldBounding.right) {
			if (font.availableStates.includes("climb") && this.allowFontClimbing) {
				this.switchState(font, "climb");

				const lastFontX = font.x;
				// const lastFontX = font.x + font.width * Math.abs(font.scaleX) * font.originX;
				if (worldBounding.left) {
					/*
					 * not quite sure if this is correct, but after a lot of experiment
					 * i found out that the font will be stuck at the left side of the screen
					 * which will result in font.x = negative number. Because we disable and enable
					 * font body when drag, the font will go back with absolute value of font.x
					 * so i get lastFontX to minus with petLeftPosition to get the correct position
					 */
					font.setPosition(lastFontX - this.getFontLeftPosition(font), font.y);
					this.setFontLookToTheLeft(font, true);
				} else {
					font.setPosition(lastFontX + this.getFontRightPosition(font), font.y);
					this.setFontLookToTheLeft(font, false);
				}
			} else {
				if (worldBounding.down) {
					// if font on the ground and beyond screen and doesn't have climb state, we flip the font
					this.toggleFlipXThenUpdateDirection(font);
				} else {
					// if font bounding left or right and not on the ground, we make the font jump or spawn on the ground
					this.petJumpOrPlayRandomState(font);
				}
			}
		} else {
			if (worldBounding.down) {
				// if font is on the ground after being dragged and they are not bounding left or right, we play random state
				if (
					font.anims &&
					font.anims.getName() === this.configManager.getStateName("drag", font)
				) {
					this.switchState(font, this.getOneRandomState(font));
				}
			} else {
				// if font is not on the ground and they are not bounding left or right, we make the font jump or spawn on the ground
				this.petJumpOrPlayRandomState(font);
			}
		}
	}
}
