"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ErrorState
        title="This admin screen could not be rendered"
        body="The screen failed before it could display its data. Nothing was changed — these admin pages have no write path in the prototype, so a failure here cannot have altered an order, a price or a stock figure."
        detail={error.message ? `Reported reason: ${error.message}` : undefined}
        onRetry={reset}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={reset}>
          Retry this screen
        </Button>
        <ButtonLink href="/admin" variant="quiet" size="md">
          Back to the dashboard
        </ButtonLink>
      </div>
      <p className="text-[0.6875rem] text-graphite-light">
        In production this component is replaced by a query error state with a retry against the Supabase service layer.
      </p>
    </div>
  );
}
