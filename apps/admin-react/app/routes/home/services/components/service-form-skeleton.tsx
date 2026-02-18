import { Card, CardContent, CardHeader } from '@front/cn/components/card';
import { Skeleton } from '@front/cn/components/skeleton';

export function ServiceFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-64" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
