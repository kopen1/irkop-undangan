import type { InvitationContent, InvitationFull, WishRow } from "../../../lib/types";

export interface ThemeProps {
  invitation: InvitationFull;
  content: InvitationContent;
  guestName: string | null;
  guestId: string | null;
  wishes: WishRow[];
  onNewWish: (wish: WishRow) => void;
  onRsvpDone: () => void;
  /** Mode pratinjau: form dinonaktifkan, ada bar demo di atas. */
  demo?: boolean;
}
