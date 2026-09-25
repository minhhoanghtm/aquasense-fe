import { useOutletContext } from "react-router-dom";
import SecurityTab from "../../features/Profile/SecurityTab";
import type { ProfileContextValue } from "./ProfileLayout";
import { useProfileContext } from "./ProfileLayout";

export default function SecurityPage() {
  const outletCtx = useOutletContext<ProfileContextValue>();
  const customCtx = useProfileContext();
  const ctx = outletCtx || customCtx;

  return <SecurityTab user={ctx?.user ?? null} />;
}
