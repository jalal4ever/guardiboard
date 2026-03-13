import { cn } from '@guardiboard/ui';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white shadow-sm border border-slate-200 p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
