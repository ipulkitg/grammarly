import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`h-8 w-8 animate-spin text-gray-500 ${className || ''}`} />
    </div>
  )
}
