// import { MantineProvider } from "@mantine/core";
// import { confirm } from "@tauri-apps/api/dialog";
// import { appWindow } from "@tauri-apps/api/window";
// import React, { Suspense } from "react";
// import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import Loading from "./Loading";
// import StickyNote from "./StickyNotes";
// import { useDefaultFonts, useFonts } from "./hooks/useFonts";
// import { useSettings } from "./hooks/useSettings";
// import { ColorSchemeType } from "./types/ISetting";
// import { PrimaryColor } from "./utils";

// const PhaserWrapper = React.lazy(() => import("./PhaserWrapper"));
// const SettingWindow = React.lazy(() => import("./SettingWindow"));

// function App() {
// 	useSettings();
// 	useDefaultFonts();
// 	const { isError, error } = useFonts();

// 	if (isError) {
// 		confirm(`Error: ${error.message}`, {
// 			title: "ZingFont Dialog",
// 			type: "error",
// 		}).then((ok) => {
// 			if (ok !== undefined) {
// 				appWindow.close();
// 			}
// 		});
// 	}

// 	return (
// 		<Router>
// 			<Routes>
// 				{/* <Route path="/" element={<PhaserWrapper />} /> */}
// 				<Route path="/" element={<StickyNote />} />
// 				<Route
// 					path="/setting"
// 					element={
// 						<Suspense fallback={<Loading />}>
// 							<MantineProvider
// 								defaultColorScheme={ColorSchemeType.Light}
// 								theme={{
// 									fontFamily:
// 										"Plus Jakarta Sans, Siemreap, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
// 									colors: {
// 										dark: [
// 											"#C1C2C5",
// 											"#A6A7AB",
// 											"#909296",
// 											"#5C5F66",
// 											"#373A40",
// 											"#2C2E33",
// 											// shade
// 											"#1A1B1E",
// 											// background
// 											"#141517",
// 											"#1A1B1E",
// 											"#101113",
// 										],
// 									},
// 									primaryColor: PrimaryColor,
// 								}}
// 							>
// 								<SettingWindow />
// 							</MantineProvider>
// 						</Suspense>
// 					}
// 				/>
// 			</Routes>
// 		</Router>
// 	);
// }

// export default App;
