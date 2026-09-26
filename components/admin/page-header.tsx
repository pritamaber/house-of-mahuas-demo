export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[36px] leading-none sm:text-[44px]">{title}</h1>
        {description && <p className="mt-2 text-[14.5px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function AdminPage({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[84rem] space-y-8 px-4 py-8 sm:px-8 lg:py-10">{children}</div>;
}
