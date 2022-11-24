import { LanguageContext } from '../contexts/LanguageContext'
import { UserContext } from '../contexts/UserContext'
import { useContext } from 'react'

const Logged = () => {
  const { getExpression } = useContext(LanguageContext)
  const { email } = useContext(UserContext)
  return <div>{email || getExpression('youAreNotLoggedIn')}</div>
}

export default Logged
