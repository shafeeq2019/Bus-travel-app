"use client";

import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { SessionProvider, useSession } from "next-auth/react";
import { makeStore, AppStore } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { setSession, clearSession, setSessionLoading } from "@/store/authSlice";

function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "loading") {
      dispatch(setSessionLoading());
    } else if (status === "authenticated" && session?.user) {
      dispatch(
        setSession({
          userId: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          role: session.user.role
        })
      );
    } else {
      dispatch(clearSession());
    }
  }, [status, session, dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <SessionProvider>
      <Provider store={storeRef.current}>
        <SessionSync>{children}</SessionSync>
      </Provider>
    </SessionProvider>
  );
}
