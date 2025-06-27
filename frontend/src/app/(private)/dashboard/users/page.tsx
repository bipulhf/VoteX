import { getAllUsers } from "@/actions/users.action";
import { UserTable } from "@/components/dashboard/users-table";
import { ExportUsersButton } from "@/components/dashboard/export-users-button";
import { User } from "@/lib/type";

export default async function UsersPage() {
  const users = await getAllUsers();

  if (users.error) {
    return <div>{users.error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all users registered on the platform.
          </p>
        </div>
        <div className="">
          <ExportUsersButton users={users.data as User[]} />
        </div>
      </div>
      <UserTable initialUsers={users.data as User[]} />
    </div>
  );
}
