import { AlertsUnsubscribeClient } from "./unsubscribe-client";

interface AlertsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AlertsUnsubscribePage({
  searchParams,
}: AlertsPageProps) {
  const params = (await searchParams) ?? {};
  const raw = params.token;
  const token =
    typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : "";

  return <AlertsUnsubscribeClient token={token} />;
}
