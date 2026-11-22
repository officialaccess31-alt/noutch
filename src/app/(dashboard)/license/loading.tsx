import { Content, Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <Content aria-busy="true">
      <Skeleton $h="34px" $w="160px" />
      <div style={{ height: 36 }} />
      <Skeleton $h="200px" />
    </Content>
  )
}
