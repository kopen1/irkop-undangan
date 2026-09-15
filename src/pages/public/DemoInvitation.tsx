import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { buildDemoContent, buildDemoInvitation, DEMO_WISHES } from "../../lib/demo";
import { getThemeTokens } from "../../lib/theme-tokens";
import ThemeRenderer from "./invitation/ThemeRenderer";

export default function DemoInvitation() {
  const { themeKey } = useParams<{ themeKey: string }>();
  const tokens = getThemeTokens(themeKey);
  const [wishes] = useState(DEMO_WISHES);

  const invitation = useMemo(() => buildDemoInvitation(tokens), [tokens]);
  const content = useMemo(() => buildDemoContent(tokens), [tokens]);

  useEffect(() => {
    document.title = `Demo tema ${tokens.name} — Invite`;
    return () => {
      document.title = "Invite — Undangan Digital";
    };
  }, [tokens.name]);

  return (
    <ThemeRenderer
      demo
      invitation={invitation}
      content={content}
      guestName="Bapak/Ibu Tamu Undangan"
      guestId={null}
      wishes={wishes}
      onNewWish={() => undefined}
      onRsvpDone={() => undefined}
    />
  );
}
