import { createContext } from 'react'

type State = {
  messages: Record<number, string>
  setMessage: (message: string, timeout?: number) => void
}

export const MessageContext = createContext<State>({
  messages: {},
  setMessage: () => undefined,
})
