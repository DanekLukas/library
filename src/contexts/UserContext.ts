import { LoginUserProps } from './UserProvider'
import { createContext } from 'react'

type State = {
  loginUser: (props: LoginUserProps) => void
  logoutUser: () => void
  getUser: () => LoginUserProps
  inRole: (props: string) => boolean
  email: string
}

export const UserContext = createContext<State>({
  loginUser: () => undefined,
  logoutUser: () => undefined,
  getUser: () => ({ id: '', email: '', roles: [], remember: false }),
  inRole: (role: string): boolean => false,
  email: '',
})
