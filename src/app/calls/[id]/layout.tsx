import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  return {
    title: `Call Details - ${params.id}`,
    description: 'Detailed view of customer call'
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="call-detail-container">{children}</div>
} 