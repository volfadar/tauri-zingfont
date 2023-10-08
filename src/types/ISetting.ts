import { ColorScheme } from "@mantine/core";
import { LazyExoticComponent, MemoExoticComponent } from "react";
import { ISpriteConfig } from "./ISpriteConfig";
import { DispatchType } from "./IEvents";

export interface IGetAppSetting {
    configName?: string,
    key?: string,
}

export interface ISetSetting extends IGetAppSetting {
    configName?: string,
    key?: string,
    setKey: string,
    newValue: unknown,
}

export type TAppSetting = {
    language: string,
    theme: ColorScheme
    allowPetAboveTaskbar: boolean,
    allowPetInteraction: boolean,
    allowOverridePetScale: boolean,
    petScale: number,
}

export interface IHandleSettingChange {
    (
        dispatchType: DispatchType,
        newValue: string | boolean | ISpriteConfig | number,
    ): void;
}

export enum ESettingTab {
    MyPets = 0,
    PetShop = 1,
    Settings = 2,
    About = 3,
}

export interface ISettingTabs {
    Component: MemoExoticComponent<() => JSX.Element>,
    title: string,
    description: string,
    Icon: React.ReactNode;
    label: string;
    tab: ESettingTab,
}

export interface ISettingsContent {
    title: string,
    description: string,
    checked: boolean,
    dispatchType: DispatchType,
    component?: React.ReactNode,
}