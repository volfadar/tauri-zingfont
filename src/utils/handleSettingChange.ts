import { setSettings, toggleAutoStartUp } from "./settingsHelper";
import { HandleSettingChange, Theme } from "./type";
import { useSettingStore } from "../hooks/useSettingStore";
import { WebviewWindow } from '@tauri-apps/api/window'

export const handleSettingChange: HandleSettingChange = (dispatchType, newValue) => {
    /* 
     * Reading/writing state and reacting to changes outside of components, for more detail read  
     * zustand docs here: https://docs.pmnd.rs/zustand/recipes/recipes
     */
    const { setLanguage, setTheme, setIsAutoStartUp, setIsPetAboveTaskbar } = useSettingStore.getState();

    switch (dispatchType) {
        case 'changeAppLanguage':
            setSettings({ setKey: 'language', newValue: newValue });
            setLanguage(newValue as string);
            return
        case 'changeAppTheme':
            setSettings({ setKey: "theme", newValue: newValue });
            setTheme(newValue as Theme);
            return
        case 'switchAutoWindowStartUp':
            // auto start up doesn't need to be saved in settings.json
            toggleAutoStartUp(newValue as boolean);
            setIsAutoStartUp(newValue as boolean);
            return
        case 'switchPetAboveTaskBar':
            setSettings({ setKey: "isPetAboveTaskbar", newValue: newValue });
            setIsPetAboveTaskbar(newValue as boolean);

            (async () => {
                // get the window instance by its label
                const mainWindow = WebviewWindow.getByLabel('main');

                if (mainWindow) {
                    await mainWindow.emit('render', {
                        message: 'Hey, re-render pets! :)',
                        isPetAboveTaskbar: newValue,
                    });
                }
            })();
        default:
            return;
    }
};