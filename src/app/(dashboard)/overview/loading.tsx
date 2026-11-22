import { Content, Metrics, Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <Content aria-busy="true">
      <Skeleton $h="34px" $w="220px" />
      <div style={{ height: 12 }} />
      <Skeleton $h="16px" $w="360px" />
      <div style={{ height: 27 }} />
      <Metrics>
        <Skeleton $h="84px" />
        <Skeleton $h="84px" />
        <Skeleton $h="84px" />
      </Metrics>
      <Skeleton $h="260px" />
    </Content>
  )
}
