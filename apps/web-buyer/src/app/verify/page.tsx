import { VerifyCertificateClient } from "@/components/buyer/verify/verify-certificate-client";

type VerifySearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyPage({ searchParams }: { searchParams: VerifySearchParams }) {
  const params = await searchParams;
  const mode = getParam(params.mode) === "qr" ? "qr" : "code";
  const code = getParam(params.code) ?? "";

  return <VerifyCertificateClient initialMode={mode} initialCode={code} />;
}
