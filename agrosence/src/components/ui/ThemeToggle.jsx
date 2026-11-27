/** Light/dark toggle button. <ThemeToggle /> */
import { LuMoon, LuSun } from 'react-icons/lu'
import { useTheme } from '../../hooks/useTheme'
import { IconButton } from './Button'

export function ThemeToggle(props) {
  const { resolved, toggle } = useTheme()
  const dark = resolved === 'dark'
  return (
    <IconButton label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle} {...props}>
      {dark ? <LuSun /> : <LuMoon />}
    </IconButton>
  )
}
