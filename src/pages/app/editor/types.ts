import type { updateInvitation } from "../../../lib/api";
import type { InvitationFull } from "../../../lib/types";

export type InvitationPatch = Parameters<typeof updateInvitation>[1];

export interface EditorTabProps {
  invitation: InvitationFull;
  reload: () => Promise<void>;
  update: (patch: InvitationPatch) => Promise<void>;
}
