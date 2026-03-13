import { CircleScreen } from '@/components/CircleScreen'

export function generateStaticParams() {
  return [
    { circle: 'fob-a' },
    { circle: 'fob-b' },
    { circle: 'wine' },
    { circle: 'weights' },
    { circle: 'story' },
    { circle: 'street' },
  ]
}

export default async function CirclePage({
  params,
}: {
  params: Promise<{ circle: string }>
}) {
  const { circle } = await params
  return <CircleScreen circle={circle} />
}
