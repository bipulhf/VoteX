import { getMyElectionsDuty } from "@/actions/election.action";
import ElectionCommissionWrapper from "@/components/dashboard/election-commission-wrapper";

export default async function MyElectionsDutyPage() {
  const myElectionsDuty = await getMyElectionsDuty();

  if (myElectionsDuty.error) {
    return <div>{myElectionsDuty.error}</div>;
  }

  return <ElectionCommissionWrapper myElectionsDuty={myElectionsDuty.data} />;
}
