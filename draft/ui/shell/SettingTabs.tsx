import { Route } from "@/routes/settings";
import { useNavigate } from "@tanstack/react-router";
import { memo, useCallback } from "react";
// import { useSearchParams } from "@tanstack/react-router";
import { useSettingTabStore } from "../../hooks/useSettingTabStore";
import type { ISettingTabsProps } from "../../types/components/type";
import SettingTab from "./SettingTab";

function SettingTabs({ activeTab, settingTabs }: ISettingTabsProps) {
	// const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const { setActiveTab } = useSettingTabStore();

	const handleSetTab = useCallback(
		(index: number) => {
			setActiveTab(index);
			navigate({ search: { tab: index } });
		},
		[setActiveTab, navigate],
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
