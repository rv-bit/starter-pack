import type { Auth } from "./auth.server";

import { adminClient, emailOTPClient, inferAdditionalFields, twoFactorClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ac, admin, defaultRoles } from "./permissions";

const authClient = createAuthClient({
	plugins: [
		twoFactorClient(),
		usernameClient(),
		emailOTPClient(),
		adminClient({
			// Use the default roles from the shared package
			defaultRoles,

			// Pass the access control and roles
			ac,
			roles: {
				admin,
			},
		}),

		inferAdditionalFields<Auth>(),
	],
});

type Session = typeof authClient.$Infer.Session;
type User = typeof authClient.$Infer.Session.user;

export type { Session, User };
export default authClient;
