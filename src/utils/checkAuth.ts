import { UserAuth } from "../types";

export default function checkAuth(auth?: UserAuth, permissions: string[] = []): boolean {
  let validate = auth?.name === "admin" || permissions?.length === 0;
  if (!validate)
    permissions.forEach((permission) => {
      const privileges = auth?.privileges;
      if (privileges?.map(({ app }) => app)?.includes(permission))
        validate = true;
    });
  return Boolean(validate);
}
