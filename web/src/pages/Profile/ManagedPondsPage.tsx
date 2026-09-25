import { useOutletContext } from "react-router-dom";
import ManagedPondsTab from "../../features/Profile/ManagedPondsTab";
import type { ProfileContextValue } from "./ProfileLayout";
import { useProfileContext } from "./ProfileLayout";

export default function ManagedPondsPage() {
  const outletCtx = useOutletContext<ProfileContextValue>();
  const customCtx = useProfileContext();
  const ctx = outletCtx || customCtx;

  return (
    <ManagedPondsTab
      ponds={ctx?.ponds ?? []}
      devices={ctx?.devices ?? []}
      user={ctx?.user ?? null}
    />
  );
}
