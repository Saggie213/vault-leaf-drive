import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
