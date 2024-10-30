import { memo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useSettingTabStore } from "../../hooks/useSettingTabStore";
import type { ISettingTabsProps } from "../../types/components/type";
import SettingTab from "./SettingTab";

function SettingTabs({ activeTab, settingTabs }: ISettingTabsProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { setActiveTab } = useSettingTabStore();

	const handleSetTab = useCallback(
		(index: number) => {
			setActiveTab(index);

			// update url search params
			searchParams.set("tab", index.toString());
			setSearchParams(searchParams);
		},
		[setActiveTab, searchParams, setSearchParams],
	);

	const sections = settingTabs.map((settingTab) => (
		<SettingTab
			label={settingTab.label}
			Icon={settingTab.Icon}
			key={settingTab.label}
			active={settingTab.tab === activeTab}
			handleSetTab={() => handleSetTab(settingTab.tab)}
		/>
	));

	return <>{sections}</>;
}

export default memo(SettingTabs);
