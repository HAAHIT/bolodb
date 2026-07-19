"use client";

import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";
import { appState } from "@/lib/app-state";

export default function LoginPage() {
  const router = useRouter();
  return <LoginScreen onLogin={() => appState.init(true, router)} />;
}
