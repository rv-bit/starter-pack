import { env } from "~/utils/environment/env.server";

export const trustedOrigins = env.TRUSTED_ORIGINS
	?.split(",")
	.map((origin) => {
		return origin.startsWith("http") ? origin : `https://${origin}`;
	});
