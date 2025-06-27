import ElectionsPage from "@/components/dashboard/election-wrapper";
import { getAllElectionsAdmin } from "@/actions/election.action";
import { getAllElectionTypes } from "@/actions/electionType.action";
import { getAllUsers } from "@/actions/users.action";

export default async function DashboardPage() {
  const elections = await getAllElectionsAdmin();
  const electionTypes = await getAllElectionTypes();
  const users = await getAllUsers();

  if (elections.error || electionTypes.error || users.error) {
    return (
      <div>Error: {elections.error || electionTypes.error || users.error}</div>
    );
  }

  return (
    <ElectionsPage
      elections={elections.data}
      electionTypes={electionTypes.data}
      users={users.data}
    />
  );
}
