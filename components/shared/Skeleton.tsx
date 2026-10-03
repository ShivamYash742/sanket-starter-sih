import { Skeleton as BaseSkeleton } from '@/components/ui/skeleton'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <BaseSkeleton className={className} {...props} />
}
