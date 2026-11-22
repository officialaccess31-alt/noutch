import { Content, Metrics, Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <Content aria-busy="true">
      <Skeleton $h="34px" $w="160px" />
      <div style={{ height: 36 }} />
      <Metrics>
        <Skeleton $h="84px" />
      </Metrics>
      <Skeleton $h="220px" />
    </Content>
  )
}
