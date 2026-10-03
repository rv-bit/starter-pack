/* eslint-disable node/prefer-global/process */
import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function parseUserAgent(userAgent: string): {
	system: string;
	browser: string;
	isMobile: boolean;
} {
	const ua = userAgent.toLowerCase();

	let system = "Unknown";
	let isMobile = false;

	if (ua.includes("android")) {
		system = "Android";
		isMobile = true;
	} else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
		system = "iOS";
		isMobile = true;
	} else if (ua.includes("windows")) {
		system = "Windows";
	} else if (ua.includes("mac os") || ua.includes("macos")) {
		system = "Macintosh";
	} else if (ua.includes("linux")) {
		system = "Linux";
	}

	const browserMatchers: {
		regex: RegExp;
		name: (match: RegExpMatchArray) => string;
	}[] = [
		{ regex: /firefox\/(\d+(\.\d+)?)/, name: match => `Firefox ${match[1]}` },
		{ regex: /edg\/(\d+(\.\d+)?)/, name: match => `Edge ${match[1]}` },
		{ regex: /chrome\/(\d+(\.\d+)?)/, name: match => `Chrome ${match[1]}` },
		{ regex: /safari\/(\d+(\.\d+)?)/, name: match => `Safari ${match[1]}` },
		{
			regex: /(opera|opr)\/(\d+(\.\d+)?)/,
			name: match => `Opera ${match[2]}`,
		},
	];

	let browser = "Unknown";

	for (const matcher of browserMatchers) {
		const match = ua.match(matcher.regex);
		if (match && !(matcher.regex.source.includes("safari") && ua.includes("chrome"))) {
			browser = matcher.name(match);
			break;
		}
	}

	return { system, browser, isMobile };
}

export function formatSessionTime(time: number | string | Date): string {
	switch (typeof time) {
		case "number":
			break;
		case "string":
			time = +new Date(time);
			break;
		case "object":
			if (time.constructor === Date)
				time = time.getTime();
			break;
		default:
			time = Date.now();
	}

	const time_formats = [
		[60, "seconds", 1], // 60
		[120, "1 minute ago", "1 minute from now"], // 60*2
		[3600, "minutes", 60], // 60*60, 60
		[7200, "1 hour ago", "1 hour from now"], // 60*60*2
		[86400, "hours", 3600], // 60*60*24, 60*60
		[172800, "Yesterday", "Tomorrow"], // 60*60*24*2
		[604800, "days", 86400], // 60*60*24*7, 60*60*24
		[1209600, "Last week", "Next week"], // 60*60*24*7*4*2
		[2419200, "weeks", 604800], // 60*60*24*7*4, 60*60*24*7
		[4838400, "Last month", "Next month"], // 60*60*24*7*4*2
		[29030400, "months", 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
		[58060800, "Last year", "Next year"], // 60*60*24*7*4*12*2
		[2903040000, "years", 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
		[5806080000, "Last century", "Next century"], // 60*60*24*7*4*12*100*2
		[58060800000, "centuries", 2903040000], // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
	];

	let seconds = (Date.now() - +time) / 1000;
	let token = "ago";
	let list_choice = 1;

	if (seconds === 0) {
		return "Just now";
	}
	if (seconds < 0) {
		seconds = Math.abs(seconds);
		token = "from now";
		list_choice = 2;
	}
	let i = 0;
	let format: (string | number)[];
	while ((format = time_formats[i++])) {
		if (seconds < Number(format[0])) {
			if (typeof format[2] == "string")
				return String(format[list_choice]);
			else return `${Math.floor(seconds / format[2])} ${format[1]} ${token}`;
		}
	}

	return String(time);
};

export function getPasswordStrength(password: string) {
	if (!password)
		return 0;

	const criteria = [
		/(?=.*\d)/, // Contains at least one number
		/(?=.*[a-z])/, // Contains at least one lowercase
		/(?=.*[A-Z])/, // Contains at least one uppercase
		/(?=.*[!@#$%^&*(),.?":{}|<>])/, // Contains at least one special character
	];

	return criteria.reduce((strength, regex) => strength + (regex.test(password) ? 1 : 0), 0);
}

export function hexToRgba(hex: string, alpha: number): string {
	const clean = hex.replace("#", "");
	const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
	const r = Number.parseInt(full.substring(0, 2), 16);
	const g = Number.parseInt(full.substring(2, 4), 16);
	const b = Number.parseInt(full.substring(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function groupBy<T>(array: T[], key: (item: T) => string) {
	return array.reduce((result, item) => {
		const group = key(item);
		if (!result[group])
			result[group] = [];
		result[group].push(item);
		return result;
	}, {} as Record<string, T[]>);
}

export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function getErrorMessage(error: unknown) {
	if (typeof error === "string")
		return error;
	if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
		return error.message;
	}
	console.error("Unable to get error message for error", error);
	return "Unknown Error";
}

export function getBaseUrl() {
	if (typeof window !== "undefined")
		return window.location.origin;
	return process.env.NEXT_PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
