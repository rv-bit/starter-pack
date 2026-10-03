/* eslint-disable node/prefer-global/process */
import pino from "pino";

export const logger = pino({
	transport: {
		target: "pino-pretty",
		options: {
			colorize: process.env.NODE_ENV === "development",
		},
	},
	browser: {
		asObject: true,
	},
});
