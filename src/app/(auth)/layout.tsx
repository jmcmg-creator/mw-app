import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-xl">
            <Wallet className="size-6" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Patrimoine
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
