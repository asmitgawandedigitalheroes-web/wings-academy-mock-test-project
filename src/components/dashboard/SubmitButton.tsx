'use client'

import { useFormStatus } from 'react-dom'
import { Save, Loader2 } from 'lucide-react'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
    >
      {pending ? (
        <>
          Saving...
          <Loader2 className="w-5 h-5 animate-spin" />
        </>
      ) : (
        <>
          Save Changes
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </>
      )}
    </button>
  )
}
