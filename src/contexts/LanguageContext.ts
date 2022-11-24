import { createContext } from 'react'

type State = {
  getLanguages: () => Record<string, string>
  getLanguageTypes: () => ReadonlyArray<string>
  getLanguage: () => string
  setLanguage: (language: string) => void
  getExpression: (expression: string) => string
}

export const LanguageContext = createContext<State>({
  getLanguages: () => ({}),
  getLanguageTypes: () => [],
  getLanguage: () => '',
  setLanguage: () => ({}),
  getExpression: () => '',
})
