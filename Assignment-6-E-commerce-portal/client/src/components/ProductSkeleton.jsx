export default function ProductSkeleton() {
  return (
    <div className="masonry-item overflow-hidden rounded-[28px] border border-white/60 bg-white/70 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="h-60 animate-pulse rounded-[20px] bg-slate-200/80 dark:bg-slate-800" />
      <div className="space-y-3 p-3 pt-5">
        <div className="h-5 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
      </div>
    </div>
  );
}
