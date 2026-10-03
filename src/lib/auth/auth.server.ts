import type { BetterAuthOptions } from "better-auth";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { admin as adminPlugin, emailOTP, twoFactor, username } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { getBaseUrl } from "~/utils/helpers";

import { trustedOrigins } from "~/lib/config.server";
import db from "~/lib/database";
import * as schema from "~/lib/database/schema";
import { sendEmail } from "~/lib/mail/mail.server";
import * as EMAIL_TEMPLATES from "~/lib/mail/templates";

import { env } from "~/utils/environment/env.server";

import { ac, admin, defaultRoles } from "./permissions";

const APP_NAME = "Default";
const isProduction = env.NODE_ENV === "production";

function createUniqueUsername(username: string) {
	let uniqueUsername = username;
	(async () => {
		const user = await db.select().from(schema.user).where(eq(schema.user.username, username));
		let uniqueUser = user[0]; // since username is unique, there should be only one user with this username

		if (uniqueUser) {
			let i = 0;
			while (uniqueUser) {
				i += 1;
				uniqueUsername = username + i;

				const user = await db.select().from(schema.user).where(eq(schema.user.username, uniqueUsername));
				uniqueUser = user[0];
			}
		}
	})();

	return uniqueUsername;
}

const opts = {
	appName: APP_NAME,
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema,
	}),

	baseURL: getBaseUrl(),
	secret: env.AUTH_SECRET,
	trustedOrigins,

	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			scope: ["email", "profile"],
			mapProfileToUser(profile) {
				return {
					name: profile.given_name,
					email: profile.email,
					image: profile.picture,
					username: createUniqueUsername(profile.given_name + profile.family_name),
				};
			},
		},
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
			scope: ["user:email"],
			mapProfileToUser(profile) {
				return {
					name: profile.name,
					email: profile.email,
					image: profile.avatar_url,
					username: createUniqueUsername(profile.name),
				};
			},
		},
	},

	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "github"],
		},
	},

	user: {
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url }, _request) => {
				await sendEmail({
					to: user.email,
					subject: "Delete your account",
					text: `Click the link to delete your account: ${url}`,
				});
			},
		},
	},

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }, _request) => {
			await sendEmail({
				to: user.email,
				subject: "Reset your password",
				html: await EMAIL_TEMPLATES.reactResetPasswordEmail({
					username: user.name,
					resetLink: url,
				}),
			});
		},
		onExistingUserSignUp: async ({ user }, _request) => {
			void sendEmail({
				to: user.email,
				subject: "Sign-up attempt with your email",
				text: "Someone tried to create an account using your email address. If this was you, try signing in instead. If not, you can safely ignore this email.",
			});
		},
	},

	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			switch (ctx.path) {
				case "/update-user":
					break;
				default:
					break;
			}
		}),
		after: createAuthMiddleware(async (ctx) => {
			switch (ctx.query?.error) {
				case "account_already_linked_to_different_user":
					throw ctx.redirect(`${getBaseUrl()}/?error=Account already linked to different user`);
				case "email_doesn't_match":
					throw ctx.redirect(`${getBaseUrl()}/?error=Email doesn't match`);
				default:
					break;
			}
		}),
	},

	session: {
		expiresIn: 60 * 60 * 24 * 2, // 2 days
		updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
		freshAge: 60 * 60 * 24, // 1 day (session is fresh for 1 day)

		cookieCache: {
			enabled: true,
			maxAge: 60, // 60 seconds
		},
	},

	rateLimit: {
		enabled: isProduction, // enable rate limiting in production
		window: 10, // time window in seconds
		max: 100, // max requests in the window
	},

	advanced: {
		cookiePrefix: APP_NAME.toLowerCase().replace(/\s+/g, "-"),
		crossSubDomainCookies: {
			enabled: isProduction, // enable cross subdomain cookies in production
			domain: ".railway.app", // set your domain here
		},
	},

	plugins: [
		username(),
		adminPlugin({
			// Use the default roles from the shared package
			defaultRoles,

			// Pass the access control and roles
			ac,
			roles: {
				admin,
			},
		}),

		twoFactor({
			issuer: APP_NAME,
			otpOptions: {
				async sendOTP({ user, otp }, _request) {
					await sendEmail({
						to: user.email,
						subject: "Two factor authentication OTP",
						text: `Your OTP is: ${otp}`,
					});
				},
			},
		}),

		emailOTP({
			changeEmail: {
				enabled: true,
				verifyCurrentEmail: true,
			},
			overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp, type }) {
				if (type === "sign-in") {
					await sendEmail({
						to: email,
						subject: "Sign in OTP",
						text: `Your OTP is: ${otp}`,
					});
				} else if (type === "email-verification") {
					await sendEmail({
						to: email,
						subject: "Email verification OTP",
						text: `Your OTP is: ${otp}`,
					});
				} else {
					await sendEmail({
						to: email,
						subject: "Password reset OTP",
						text: `Your OTP is: ${otp}`,
					});
				}
			},
			otpLength: 6,
			expiresIn: 600, // 10 minutes
		}),
	],
} as BetterAuthOptions;

const auth = betterAuth(opts);
export type Auth = typeof auth;
export default auth;
