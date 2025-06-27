import { getAllElectionTypes } from "@/actions/electionType.action";
import { ElectionTypesTable } from "@/components/dashboard/election-types-table";

export default async function ElectionTypesPage() {
  const electionTypes = await getAllElectionTypes();

  if (electionTypes.error) {
    return <div>{electionTypes.error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Election Types Management
        </h1>
        <p className="text-muted-foreground">
          Create and manage different types of elections available on the
          platform.
        </p>
      </div>
      <ElectionTypesTable initialElectionTypes={electionTypes.data} />
    </div>
  );
}
