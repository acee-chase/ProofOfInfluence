import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { ImmortalityChat } from "@/components/ImmortalityChat";
import { ImmortalityTopBarSimple } from "@/components/immortality/ImmortalityTopBarSimple";

interface ImmortalityBalanceResponse {
  credits: number;
  poiCredits: number;
}

export default function Immortality() {
  const { isAuthenticated } = useAuth();

  const { data: balance, isFetching } = useQuery<ImmortalityBalanceResponse>({
    queryKey: ["/api/immortality/balance"],
    enabled: isAuthenticated,
  });

  const credits = balance?.credits ?? 0;

  return (
    <PageLayout>
      {/* Simplified Top Bar */}
      <ImmortalityTopBarSimple
        credits={credits}
        isFetching={isFetching}
      />

      {/* Main Content Area - Single Column Layout */}
      <main className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        <div className="min-h-[calc(100vh-180px)]">
          <ImmortalityChat />
        </div>
      </main>
    </PageLayout>
  );
}
