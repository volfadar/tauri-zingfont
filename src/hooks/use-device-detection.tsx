"use client";
import { useEffect, useState } from "react";

export function useDeviceDetection() {
	const [isMobile, setIsMobile] = useState(false);
	const [isIphone, setIsIphone] = useState(false);
	const [isIpad, setIsIpad] = useState(false);
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	const [isLargeScreen, setIsLargeScreen] = useState(false);
	const [isExtraLargeScreen, setIsExtraLargeScreen] = useState(false);
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	useEffect(() => {
		const userAgent = navigator.userAgent || navigator.vendor;

		setIsMobile(/android|iPhone|iPod|iPad/i.test(userAgent));
		setIsIphone(/iPhone/i.test(userAgent));
		setIsIpad(/iPad/i.test(userAgent));

		const handleResize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;

			setWidth(width);
			setHeight(height);

			setIsSmallScreen(width < 640);
			setIsLargeScreen(width >= 1024 && width < 1280);
			setIsExtraLargeScreen(width >= 1280);
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return {
		isMobile,
		isIphone,
		isIpad,
		isSmallScreen,
		isLargeScreen,
		isExtraLargeScreen,
		width,
		height,
	};
}
