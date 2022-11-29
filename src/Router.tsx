import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { UserContext } from './contexts/UserContext'
import Book from './pages/Book'
import Books from './pages/Books'
import ChangePassword from './pages/ChangePassword'
import ForgottenPassword from './pages/ForgottenPassword'
import Group from './pages/Group'
import Layout from './pages/Layout'
import Login from './pages/Login'
import React, { useContext, useEffect, useState } from 'react'
import Registration from './pages/Registration'
import SetPassword from './pages/SetPassword'

const Router = () => {
  const { email } = useContext(UserContext)
  const [isLoggedIn, setIsLoggedIn] = useState(email !== '')
  useEffect(() => {
    setIsLoggedIn(email !== '')
  }, [email])

  const loggedInMenu = {
    add_book: Book,
    books: Books,
    libraries: Group,
    personal: ChangePassword,
  }
  const notLoggedMenu = {
    login: Login,
    registration: Registration,
    forgotten_password: ForgottenPassword,
  }

  const getRoutes = (items: Record<string, () => JSX.Element>) => {
    return Object.keys(items).map((itm, idx) => (
      <Route
        key={idx}
        path={`${itm}`}
        element={<Layout menu={Object.keys(items)}> {React.createElement(items[itm])}</Layout>}
      />
    ))
  }

  const useQuery = () => {
    const { search } = useLocation()

    return React.useMemo(() => new URLSearchParams(search), [search])
  }

  const SetPasswordElement = () => {
    const query = useQuery()

    return (
      <Layout menu={['set-password']}>
        <SetPassword token={query.get('token') || ''} />
      </Layout>
    )
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <>
            {isLoggedIn && getRoutes(loggedInMenu)}
            {!isLoggedIn && getRoutes(notLoggedMenu)}
            <Route path='/set-password' element={<SetPasswordElement />} />s
          </>
          {isLoggedIn && <Route path='*' element={<Navigate to='/books' />} />}
          {!isLoggedIn && <Route path='*' element={<Navigate to='/login' />} />}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default Router
