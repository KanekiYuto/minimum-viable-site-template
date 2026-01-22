import { Skeleton } from "@/components/ui/skeleton";

export function CreditsSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="border border-border rounded-2xl p-5 md:p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="lg:hidden h-9 w-9 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-2xl p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border rounded-2xl p-5 md:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>

                <Skeleton className="h-8 w-56 rounded-lg" />

                <div className="space-y-2">
                  <Skeleton className="h-10 w-48" />
                </div>

                <Skeleton className="h-3 rounded-full" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-3 border border-border/50">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                  <div className="rounded-xl p-3 border border-border/50">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
