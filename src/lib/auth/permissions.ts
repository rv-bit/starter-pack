import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

// Export default roles from admin access control
export { defaultRoles } from "better-auth/plugins/admin/access";

// Create custom access control statements
const statement = {
	...defaultStatements,
	project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);
export const admin = ac.newRole({
	project: ["create", "update"],
	...adminAc.statements,
});
