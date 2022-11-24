import { ReactNode, useEffect, useState } from 'react'
import { UserContext } from './UserContext'
import { gql, useQuery } from '@apollo/client'
import utf8 from 'base-64'

const USER_STORAGE_KEY = 'USER'

const query = {
  logout: gql`
    query Query($logoutId: Int, $email: String) {
      Logout(id: $logoutId, email: $email)
    }
  `,
}

const noUser = {
  id: '',
  email: '',
  roles: [] as Array<string>,
  remember: false,
}

type Props = {
  children: ReactNode
}

export type LoginUserProps = {
  id: string
  email?: string
  roles?: Array<string>
  remember?: boolean
}

const UserProvider = ({ children }: Props) => {
  // const { getExpression } = useContext(LanguageContext)
  // const { setMessage } = useContext(MessageContext)
  const { refetch: logoutQuery } = useQuery(query.logout, {
    onError: error => {
      // console.error(error)
    },
    onCompleted: data => {
      //logout log
    },
  })

  const [email, setEmail] = useState('')
  const loginUser = ({ id, email = '', roles = [], remember = false }: LoginUserProps) => {
    const payload = utf8.encode(`${id}#${email}#${roles.join('$')}`)
    setEmail(email)

    if (remember) {
      localStorage.setItem(USER_STORAGE_KEY, payload)
    } else {
      sessionStorage.setItem(USER_STORAGE_KEY, payload)
    }
  }

  const logoutUser = () => {
    const loginUserProps: LoginUserProps = getUser()
    logoutQuery({ id: loginUserProps.id, email: loginUserProps.email })
    localStorage.removeItem(USER_STORAGE_KEY)
    sessionStorage.removeItem(USER_STORAGE_KEY)

    setEmail('')
  }

  const inRole = (role: string) => {
    const sessionItem = sessionStorage.getItem(USER_STORAGE_KEY)
    const localItem = localStorage.getItem(USER_STORAGE_KEY)
    const item = sessionItem || localItem
    if (!item) {
      return false
    }
    const user = utf8.decode(item).split('#')

    if (user.length < 3) {
      return false
    }
    const roles = user[2].split('$')
    return roles.includes(role)
  }

  const getUser = (): LoginUserProps => {
    const sessionItem = sessionStorage.getItem(USER_STORAGE_KEY)
    const localItem = localStorage.getItem(USER_STORAGE_KEY)
    const item = sessionItem || localItem

    if (!item) {
      return noUser
    }

    const [id, email, roles] = utf8.decode(item).split('#')

    if (!id || !email || !roles) {
      return noUser
    }

    return { id: id || '', email, roles: roles.split('$'), remember: Boolean(localItem) }
  }

  useEffect(() => {
    setEmail(getUser().email!)
  }, [])

  return (
    <UserContext.Provider
      value={{
        loginUser,
        logoutUser,
        getUser,
        inRole,
        email,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
