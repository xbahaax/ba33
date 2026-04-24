"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@ba33/ui-web";

export default function VerifyOtpPage() {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  return (
    <Card className="rounded-xl border border-border bg-card text-card-foreground shadow-md">
      <CardHeader className="space-y-2 p-8">
        <CardTitle className="text-2xl font-bold">Verification OTP</CardTitle>
        <CardDescription>Saisissez le code envoye a votre email professionnel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-8 pb-8 pt-0">
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Input
              key={index}
              ref={(element) => {
                refs.current[index] = element;
              }}
              inputMode="numeric"
              maxLength={1}
              className="h-12 text-center font-mono text-2xl font-bold"
              onChange={(event) => {
                if (event.target.value && index < 5) {
                  refs.current[index + 1]?.focus();
                }
              }}
            />
          ))}
        </div>
        <p className="text-center font-mono text-sm text-muted-foreground">Renvoyer dans 00:54</p>
        <Button className="w-full">Verifier</Button>
        <p className="text-center text-sm text-muted-foreground">
          Retour a{" "}
          <Link href="/login" className="text-primary hover:underline">
            la connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
