import { useOutletContext } from "react-router-dom";
import PersonalInfoTab from "../../features/Profile/PersonalInfoTab";
import type { ProfileContextValue } from "./ProfileLayout";
import { useProfileContext } from "./ProfileLayout";

export default function PersonalInfoPage() {
  const outletCtx = useOutletContext<ProfileContextValue>();
  const customCtx = useProfileContext();
  const ctx = outletCtx || customCtx;

  return (
    <PersonalInfoTab
      user={ctx?.user ?? null}
      onUserUpdated={ctx?.handleUserUpdated ?? (() => {})}
    />
  );
}
