/* eslint-disable node/prefer-global/process */
"use client";

import { z } from "zod";

import { createEnv } from "./helpers";

const env = createEnv({
	clientPrefix: "NEXT_PUBLIC",
	client: {
		NEXT_PUBLIC_DEFAULT_EMAIL: z.string().min(1, ""),
		NEXT_PUBLIC_BASE_URL: z.string().min(1, ""),
	},
	runtimeEnv: {
		NEXT_PUBLIC_DEFAULT_EMAIL: process.env.NEXT_PUBLIC_DEFAULT_EMAIL,
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
	},
});

export { env };
