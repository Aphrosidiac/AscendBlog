import type { Metadata } from 'next'
import { PeopleList } from '@/components/PeopleList'

export const metadata: Metadata = { title: 'Followers' }

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <PeopleList handle={decodeURIComponent(username)} mode="followers" />
}
