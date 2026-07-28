import { Suspense } from "react";
import CustomerContent from "@/components/customer/CustomerContent";
import { resolveTab } from "@/components/customer/tabs";

export const metadata = {
  title: "Customers — Return App",
};

// Reading searchParams opts this route into dynamic (request-time) rendering, so
// the server renders the panel named in ?tab — no flash of Overview, and link
// unfurls show the real tab. The value is validated to the allowlist here.
export default async function CustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab } = await searchParams;
  const initialTab = resolveTab(tab);
  return (
    // useSearchParams inside CustomerContent wants a Suspense boundary; on this
    // dynamic route it renders the content (with the resolved tab), not the
    // fallback.
    <Suspense fallback={null}>
      <CustomerContent initialTab={initialTab} />
    </Suspense>
  );
}
