import { redirect } from 'next/navigation'

export default function RootPage() {
  // TODO: check Supabase session; redirect to /home if logged in
  redirect('/login')
}
