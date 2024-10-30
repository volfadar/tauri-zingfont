import type { UpdateManifest } from "@tauri-apps/api/updater";
import type { DispatchType } from "../IEvents";
import type { ISettingTabs } from "../ISetting";
import type { ISpriteConfig } from "../ISpriteConfig";

export interface ISettingTabProps {
	Icon: React.ReactNode;
	label: string;
	active: boolean;
	handleSetTab: () => void;
}
export interface ISettingTabsProps {
	activeTab: number;
	settingTabs: ISettingTabs[];
}

export interface ITitleProps {
	title: string;
	description: string;
}

export enum FontCardType {
	Add = "add",
	Remove = "remove",
}

export interface IFontCardProps {
	btnLabel: string;
	btnLabelCustom?: string;
	font: ISpriteConfig;
	btnFunction: () => void;
	btnFunctionCustom?: () => void;
	type: FontCardType;
}

export interface SettingSwitchProps {
	title: string;
	description: string;
	checked: boolean;
	dispatchType: DispatchType;
	component?: React.ReactNode;
}

export interface SettingButtonProps {
	title: string;
	description: string;
	btnLabel: string;
	btnFunction: () => void;
}

export interface PhaserCanvasProps {
	font: ISpriteConfig;
	playState: string;
}

export interface UpdaterPopupProps {
	shouldUpdate: boolean;
	manifest: UpdateManifest | undefined;
}
