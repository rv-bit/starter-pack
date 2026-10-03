/* eslint-disable node/prefer-global/process */
import { z } from "zod";

import { createEnv } from "./helpers";

const env = createEnv({
	server: {
		TRUSTED_ORIGINS: z.string().min(1, "TRUSTED_ORIGINS must be set"),

		DATABASE_NAME: z.string().default(""),
		DATABASE_USER: z.string().default(""),
		DATABASE_PASSWORD: z.string().default(""),
		DATABASE_HOST: z.string().default(""),
		DATABASE_PORT: z.preprocess(val => (typeof val === "string" ? parseInt(val, 10) : val), z.number().int().optional()).default(3306),

		AUTH_SECRET: z.string().min(1, "AUTH_SECRET must be set"),

		GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID must be set"),
		GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET must be set"),

		GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID must be set"),
		GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET must be set"),

		DATABASE_FILENAME: z.string().optional().default("local.db"),

		EMAIL_SMPT_HOST: z.string().min(1, "EMAIL_SMPT_HOST must be set"),
		EMAIL_SMPT_PORT: z.string().min(1, "EMAIL_SMPT_PORT must be set"),
		EMAIL_SMPT_USER: z.string().min(1, "EMAIL_SMPT_USER must be set"),
		EMAIL_SMPT_PASSWORD: z.string().min(1, "EMAIL_SMPT_PASSWORD must be set"),
		EMAIL_SMPT_SECURE: z.string().optional(),

		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		PORT: z.preprocess(val => (typeof val === "string" ? parseInt(val, 10) : val), z.number().int().optional()).default(8080),
	},
	runtimeEnv: process.env,
});

export { env };
