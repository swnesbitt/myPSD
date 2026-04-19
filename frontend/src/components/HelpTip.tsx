import { Tooltip } from '@mantine/core'
import { IconHelpCircle } from '@tabler/icons-react'

interface Props {
  label: React.ReactNode
  size?: number
}

export function HelpTip({ label, size = 14 }: Props) {
  return (
    <Tooltip
      label={label}
      multiline
      w={320}
      withArrow
      events={{ hover: true, focus: true, touch: true }}
      transitionProps={{ duration: 120 }}
    >
      <IconHelpCircle
        size={size}
        stroke={1.8}
        style={{
          verticalAlign: 'middle',
          cursor: 'help',
          color: 'var(--mantine-color-dimmed)',
          marginLeft: 4,
        }}
      />
    </Tooltip>
  )
}
