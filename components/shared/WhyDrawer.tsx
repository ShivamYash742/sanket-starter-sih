import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Info } from 'lucide-react'

interface WhyDrawerProps {
  title?: string
  children: React.ReactNode
}

export function WhyDrawer({ title = 'Why this value?', children }: WhyDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger className="ml-1 inline-flex items-center text-xs font-medium text-accent hover:underline">
        Why?
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-accent" />
            {title}
          </SheetTitle>
          <SheetDescription>
            Evidence, assumptions, and model version details for this calculation.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
