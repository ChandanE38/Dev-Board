export default function ErrorBanner({ title = 'Unable to load data', message }) {
  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-sm text-rose-100/80">{message}</div>
    </div>
  );
}
