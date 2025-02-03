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