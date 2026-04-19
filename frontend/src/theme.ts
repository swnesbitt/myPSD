import { createTheme, type MantineColorsTuple } from '@mantine/core'

const climasBlue: MantineColorsTuple = [
  '#e7eff8',
  '#cbdaeb',
  '#98b4d7',
  '#638cc3',
  '#3a6bb2',
  '#2157a8',
  '#104da4',
  '#003e8f',
  '#00377f',
  '#002f71',
]

const dropCyan: MantineColorsTuple = [
  '#e3f6ff',
  '#cce7fa',
  '#9cccf0',
  '#69afe6',
  '#4297dd',
  '#2d87d8',
  '#1f80d7',
  '#116dc0',
  '#0061ad',
  '#005499',
]

export const theme = createTheme({
  primaryColor: 'climasBlue',
  colors: {
    climasBlue,
    dropCyan,
  },
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
})
