export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-12">
        <div className="mb-10">
          <div className="h-12 w-64 bg-muted rounded-xl animate-pulse mb-3" />
          <div className="h-5 w-80 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}