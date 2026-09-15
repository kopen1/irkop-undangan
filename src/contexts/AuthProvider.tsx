import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { ProfileRow } from "../lib/types";
import { AuthContext, type AuthContextValue } from "./AuthContext";

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  if (data) return data as ProfileRow;

  const { data: created } = await supabase
    .from("profiles")
    .insert({ id: userId })
    .select("*")
    .single();
  return (created as ProfileRow) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const sync = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        const nextProfile = await fetchProfile(nextSession.user.id);
        if (active) setProfile(nextProfile);
      } else {
        setProfile(null);
      }
    };

    supabase.auth.getSession().then(async ({ data }) => {
      await sync(data.session);
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void sync(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setProfile(await fetchProfile(user.id));
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async ({ email, password, fullName, phone }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) throw new Error(error.message);
      return { needsEmailConfirm: !data.session };
    },
    [],
  );

  const signInWithGoogleIdToken = useCallback(async (token: string, nonce?: string) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token,
      ...(nonce ? { nonce } : {}),
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (patch) => {
      if (!user) throw new Error("Belum login.");
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      setProfile(data as ProfileRow);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      isAdmin: profile?.role === "admin",
      loading,
      signIn,
      signUp,
      signInWithGoogleIdToken,
      signOut,
      updateProfile,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      loading,
      signIn,
      signUp,
      signInWithGoogleIdToken,
      signOut,
      updateProfile,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
