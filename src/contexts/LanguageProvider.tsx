import { LanguageContext } from './LanguageContext'
import { Spin } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'

const Language: Readonly<Record<string, string>> = { cs: 'Čeština', en: 'English' }

const translations: {
  messages: Record<string, () => Promise<typeof import('../translations/cs-CZ.json')>>
} = {
  messages: {
    en: () => import('../translations/en-US.json'),
    cs: () => import('../translations/cs-CZ.json'),
  },
}
type Props = {
  children: React.ReactNode
}
const storageConstName = 'language'

const getLanguageTypes = () => {
  return Object.keys(Language)
}

const languageIsValid = (lang: string): boolean => (Language[lang] ? true : false)

const getValidKey = (language?: string): string => {
  if (language && languageIsValid(language)) {
    return language
  }
  const lang = window.localStorage.getItem(storageConstName) || 'cs'
  if (languageIsValid(lang)) {
    return lang
  }
  const nav = navigator.language.substring(0, 2).toLowerCase()
  if (languageIsValid(nav)) {
    return nav
  }
  return 'en'
}

const LanguageProvider = ({ children }: Props) => {
  const [language, setLanguage] = useState<string>()
  const [dictionary, setDictionary] = useState<Record<string, string>>()

  if (!language) {
    setLanguage(getValidKey())
  }

  const getLanguages = () => {
    return Language
  }

  const dictionaryPromise: (lang: string) => Promise<Record<string, string>> = useCallback(
    (lang: string) => {
      return translations.messages[lang]()
    },
    []
  )

  const getLanguage = () => language!

  useEffect(() => {
    const setTranslation = async (lang: string) => {
      if (!translations.messages[lang]) {
        lang = 'en'
      }
      setDictionary(await dictionaryPromise(lang))
      window.localStorage.setItem(storageConstName, lang)
    }
    setTranslation(language!)
  }, [dictionaryPromise, language])

  const getExpression = (expression: string) => {
    if (!dictionary) {
      return expression
    }
    return dictionary[expression] || expression
  }

  return (
    <LanguageContext.Provider
      value={{
        getLanguages,
        getLanguageTypes,
        getLanguage,
        setLanguage,
        getExpression,
      }}
    >
      {dictionary ? children : <Spin />}
    </LanguageContext.Provider>
  )
}

export default LanguageProvider
