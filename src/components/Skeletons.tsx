import React from 'react';

interface SkeletonProps {
  className?: string;
  id?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', id }) => {
  return (
    <div
      id={id}
      className={`animate-pulse bg-slate-200/60 dark:bg-slate-800/50 rounded-lg ${className}`}
    />
  );
};

// Reusable Shimmer overlay wrapper or pulse container
export const SkeletonPulse: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

// Represents a goal card loading state (matches exact dimensions & styling of standard goal card)
export const GoalCardSkeleton: React.FC = () => {
  return (
    <div className="frosted-card p-4.5 rounded-3xl relative overflow-hidden space-y-3.5">
      <div className="flex gap-3.5 items-start">
        {/* Left Icon box placeholder */}
        <Skeleton className="h-[44px] w-[44px] rounded-2xl flex-shrink-0" />
        
        {/* Title and details placeholders */}
        <div className="flex-1 space-y-2 mt-1">
          <div className="flex justify-between items-start gap-4">
            <Skeleton className="h-4 w-7/12" />
            <Skeleton className="h-3 w-3/12 max-w-[60px]" />
          </div>
          <Skeleton className="h-3.5 w-10/12" />
        </div>
      </div>

      {/* Progress section placeholder */}
      <div className="space-y-1.5 pt-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <Skeleton className="h-3 w-4/12" />
          <Skeleton className="h-3 w-2/12" />
        </div>
        
        {/* Progress gauge placeholder */}
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* Footer metadata tags placeholder */}
      <div className="flex justify-between items-center pt-2.5 border-t border-slate-100/30">
        <div className="flex gap-1.5">
          <Skeleton className="h-[18px] w-14 rounded-md" />
          <Skeleton className="h-[18px] w-10 rounded-md" />
        </div>
        <Skeleton className="h-[18px] w-20 rounded-md" />
      </div>
    </div>
  );
};

// Represents the daily calendar registry skeleton at the top of Targets screen
export const CalendarRegistrySkeleton: React.FC = () => {
  return (
    <div className="frosted-card p-4 rounded-3xl space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[110px]" />
        <Skeleton className="h-4.5 w-16 rounded-full" />
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-3 w-4" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Represents a summary metric card or dashboard breakdown
export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="frosted-card p-5 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-5/12" />
          <Skeleton className="h-3 w-8/12" />
        </div>
        <Skeleton className="h-7 w-12 rounded-full" />
      </div>
      
      {/* Visual content placeholder (e.g. PieChart/AreaChart height placeholder) */}
      <div className="h-44 w-full flex items-center justify-center bg-slate-100/30 dark:bg-slate-900/10 rounded-2xl border border-slate-100/10">
        <Skeleton className="h-36 w-11/12 rounded-xl" />
      </div>
    </div>
  );
};

// Represents small quick stats info blocks
export const MiniStatSkeleton: React.FC = () => {
  return (
    <div className="frosted-card p-4 rounded-2xl flex flex-col gap-2 bg-white/45 dark:bg-slate-900/40">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-6/12" />
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-8/12 mt-1" />
      <Skeleton className="h-2.5 w-10/12" />
    </div>
  );
};

// Represents tasks checklist item layout placeholders
export const TaskItemSkeleton: React.FC = () => {
  return (
    <div className="frosted-card p-3 rounded-2xl flex items-center justify-between bg-white/45 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800/50">
      <div className="flex items-center gap-3 w-10/12">
        {/* Bullet checkbox icon placeholder */}
        <Skeleton className="h-5.5 w-5.5 rounded-lg flex-shrink-0" />
        <div className="space-y-1.5 w-full">
          <Skeleton className="h-3.5 w-8/12" />
          <Skeleton className="h-2.5 w-4/12" />
        </div>
      </div>
      
      {/* Right button action loader */}
      <Skeleton className="h-6 w-12 rounded-lg" />
    </div>
  );
};

// Profile details form skeletons
export const ProfileFormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center py-4 bg-white/30 dark:bg-slate-905/20 border border-white/50 dark:border-slate-900/50 rounded-3xl card-glow p-5 gap-3">
        {/* Avatar seed/image circle */}
        <Skeleton className="h-24 w-24 rounded-full border-2 border-slate-200" />
        <Skeleton className="h-4.5 w-3/12" />
        <Skeleton className="h-3 w-4/12" />
      </div>

      <div className="space-y-4 pt-1">
        {/* Form Input Skeletons */}
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="space-y-1.5">
            <Skeleton className="h-3 w-4/12" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
        ))}

        {/* Action controls button loader */}
        <Skeleton className="h-12 w-full rounded-2xl mt-4" />
      </div>
    </div>
  );
};
