import { getElectionResultsById } from "@/actions/election.action";
import SingleElectionWrapper from "@/components/dashboard/single-election-wrapper";

export default async function ElectionResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const election = await getElectionResultsById(id);

  if (election.error) {
    return <div>{election.error}</div>;
  }

  return <SingleElectionWrapper electionData={election.data} />;
}
