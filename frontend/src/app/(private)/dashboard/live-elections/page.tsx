import { getAllElections } from "@/actions/election.action";
import LiveElectionsWrapper from "@/components/dashboard/live-elections-wrapper";
import { Election } from "@/lib/type";

export default async function Page() {
  const elections = await getAllElections();

  if (elections.error) {
    return <div>Error: {elections.error}</div>;
  }

  return (
    <LiveElectionsWrapper
      elections={elections.data.filter(
        (election: Election) => election.status === "ACTIVE"
      )}
    />
  );
}
