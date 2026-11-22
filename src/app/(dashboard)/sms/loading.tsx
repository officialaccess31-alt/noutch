import { Content, Skeleton } from '@/components/ui'

export default function Loading() {
  return (
    <Content aria-busy="true">
      <Skeleton $h="34px" $w="200px" />
      <div style={{ height: 36 }} />
      <Skeleton $h="420px" />
    </Content>
  )
}
