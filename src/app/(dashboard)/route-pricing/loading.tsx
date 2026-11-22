import { Content, Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <Content aria-busy="true">
      <Skeleton $h="34px" $w="220px" />
      <div style={{ height: 36 }} />
      <Skeleton $h="260px" />
    </Content>
  )
}
