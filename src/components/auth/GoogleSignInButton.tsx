import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

const CLIENT_ID = ((import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "").trim();

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleButtonConfig {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce?: string;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, config: GoogleButtonConfig) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

let gisPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gisPromise = null;
        reject(new Error("Gagal memuat Google Sign-In."));
      };
      document.head.appendChild(script);
    });
  }
  return gisPromise;
}

async function createNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return { raw, hashed };
}

export function GoogleSignInButton({
  text = "signin_with",
}: {
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const { signInWithGoogleIdToken } = useAuth();
  const toast = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        toast.error("Google tidak mengirimkan token.");
        return;
      }
      try {
        await signInWithGoogleIdToken(response.credential, nonceRef.current ?? undefined);
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [signInWithGoogleIdToken, toast],
  );

  useEffect(() => {
    if (!CLIENT_ID) return;
    let active = true;

    void (async () => {
      try {
        await loadGis();
        const container = containerRef.current;
        if (!active || !container) return;
        const { raw, hashed } = await createNonce();
        nonceRef.current = raw;
        const google = window.google;
        if (!google?.accounts?.id) throw new Error("Google Sign-In tidak tersedia.");
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
          nonce: hashed,
          auto_select: false,
        });
        google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          logo_alignment: "left",
          width: Math.min(Math.max(container.clientWidth, 200), 400),
        });
      } catch (err) {
        if (active) setError((err as Error).message);
      }
    })();

    return () => {
      active = false;
    };
  }, [handleCredential, text]);

  if (!CLIENT_ID) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Login Google belum dikonfigurasi. Isi <code>VITE_GOOGLE_CLIENT_ID</code>.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div ref={containerRef} className="flex w-full justify-center" />
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
