"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "loading" | "active" | "idle" | "enrolling";

export function TwoFactorCard() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [activeFactorId, setActiveFactorId] = useState<string | null>(null);
  const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refreshFactors() {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((factor) => factor.status === "verified");
    setActiveFactorId(verified?.id ?? null);
    setStatus(verified ? "active" : "idle");
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.find(
        (factor) => factor.status === "verified",
      );
      setActiveFactorId(verified?.id ?? null);
      setStatus(verified ? "active" : "idle");
    });
  }, []);

  async function startEnrollment() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
    });
    if (enrollError || !data) {
      setError(enrollError?.message ?? "Échec de l'activation.");
      setBusy(false);
      return;
    }
    setEnrollFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setStatus("enrolling");
    setBusy(false);
  }

  async function confirmEnrollment(event: React.FormEvent) {
    event.preventDefault();
    if (!enrollFactorId) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollFactorId,
      code,
    });
    if (verifyError) {
      setError("Code invalide. Réessayez.");
      setCode("");
      setBusy(false);
      return;
    }
    setCode("");
    setQrCode(null);
    setSecret(null);
    setEnrollFactorId(null);
    await refreshFactors();
    router.refresh();
  }

  async function cancelEnrollment() {
    if (enrollFactorId) {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: enrollFactorId });
    }
    setEnrollFactorId(null);
    setQrCode(null);
    setSecret(null);
    setCode("");
    setError(null);
    setStatus("idle");
  }

  async function disable2fa() {
    if (!activeFactorId) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.mfa.unenroll({ factorId: activeFactorId });
    setActiveFactorId(null);
    setBusy(false);
    await refreshFactors();
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <ShieldCheck className="text-primary size-5" />
        <CardTitle className="mt-2 text-base">
          Double authentification
        </CardTitle>
        <CardDescription>
          Un code à 6 chiffres via Google Authenticator (ou équivalent) à chaque
          connexion.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {status === "loading" && (
          <Loader2 className="text-muted-foreground size-5 animate-spin" />
        )}

        {status === "active" && (
          <>
            <p className="text-success text-sm font-medium">✓ 2FA activée</p>
            <Button variant="outline" onClick={disable2fa} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              Désactiver
            </Button>
          </>
        )}

        {status === "idle" && (
          <Button onClick={startEnrollment} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Activer la 2FA
          </Button>
        )}

        {status === "enrolling" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm">
              1. Scannez ce QR code avec votre application
              d&apos;authentification.
            </p>
            {qrCode && (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode}
                  alt="QR code de configuration 2FA"
                  className="size-44 rounded-lg bg-white p-2"
                />
              </div>
            )}
            {secret && (
              <p className="text-muted-foreground text-center text-xs break-all">
                Ou saisissez la clé : <code>{secret}</code>
              </p>
            )}
            <form onSubmit={confirmEnrollment} className="flex flex-col gap-3">
              <Label htmlFor="enroll-code">2. Saisissez le code généré</Label>
              <Input
                id="enroll-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
                className="text-center text-lg tracking-[0.5em]"
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={cancelEnrollment}
                  disabled={busy}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={busy || code.length !== 6}
                >
                  {busy && <Loader2 className="animate-spin" />}
                  Confirmer
                </Button>
              </div>
            </form>
          </div>
        )}

        {error && status !== "enrolling" && (
          <p className="text-destructive text-sm">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
