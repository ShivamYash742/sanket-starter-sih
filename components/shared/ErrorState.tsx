import { AlertTriangle } from 'lucide-react'

export function ErrorState({ error, retry }: { error: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
      <AlertTriangle className="h-6 w-6" />
      <h3 className="mt-4 font-semibold">Something went wrong</h3>
      <p className="mt-2 text-sm opacity-80">{error}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 rounded bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
        >
          Try again
        </button>
      )}
    </div>
  )
}
