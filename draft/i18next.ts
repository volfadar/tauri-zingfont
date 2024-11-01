import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import English from "./locale/en/translation.json";

const defaultLanguage = "en";

i18next.use(initReactI18next).init({
	lng: localStorage.getItem("language") || defaultLanguage,
	fallbackLng: defaultLanguage,
	resources: {
		en: {
			translation: English,
		},
	},
});

export default i18next;
