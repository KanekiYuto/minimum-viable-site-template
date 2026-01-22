import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
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

      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />

        <div className="border border-border rounded-2xl p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />

              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />

        <div className="border border-border rounded-2xl p-5 md:p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
