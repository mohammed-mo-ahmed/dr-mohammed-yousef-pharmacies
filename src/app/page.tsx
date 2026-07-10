import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLang = headersList.get("accept-language") || "";
  const prefersEnglish = acceptLang.startsWith("en");
  redirect(prefersEnglish ? "/en" : "/ar");
}
