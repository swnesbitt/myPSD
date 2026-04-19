import { List, Paper, Title } from '@mantine/core'
import type { AssumptionsData } from '../types'

interface Props {
  data: AssumptionsData | null
}

export function Assumptions({ data }: Props) {
  if (!data) return null
  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Title order={4} mb="xs">
        Hydrometeor assumptions — {data.title}
      </Title>
      <List size="sm" spacing={4}>
        {data.bullets.map((b, i) => (
          <List.Item key={i}>{b}</List.Item>
        ))}
      </List>
    </Paper>
  )
}
