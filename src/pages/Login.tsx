import { Button, Checkbox, Form, Input } from 'antd'
import { Form15rem } from '../utils'
import { LanguageContext } from '../contexts/LanguageContext'
import { MessageContext } from '../contexts/MessageContext'
import { UserContext } from '../contexts/UserContext'
import { gql, useQuery } from '@apollo/client'
import { useContext, useState } from 'react'

// import { useNavigate } from 'react-router-dom'

const query = {
  login: gql`
    query Login($email: String, $password: String) {
      Login(email: $email, password: $password) {
        error
        data {
          id
          email
          roles
        }
        message
      }
    }
  `,
}

const Login = () => {
  // const navigate = useNavigate()
  const { getExpression } = useContext(LanguageContext)
  const { loginUser } = useContext(UserContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const { setMessage } = useContext(MessageContext)
  const { refetch: login } = useQuery(query.login, {
    skip: true,
    onCompleted: data => {
      if (data.Login.error) {
        setMessage(getExpression(data.Login.message))
        return
      }
      loginUser({
        id: data.Login.data.id,
        email: data.Login.data.email,
        roles: data.Login.data.roles,
        remember: remember,
      })
    },
  })

  const onFinish = () => {
    login({
      email: email,
      password: password,
    })
    return
  }

  const onFinishFailed = () => {
    return
  }

  return (
    <Form15rem
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete='off'
    >
      <Form.Item
        label={getExpression('email')}
        rules={[
          {
            required: true,
            message: getExpression('EnterYourEmail'),
          },
        ]}
      >
        <Input
          onChange={e => {
            setEmail(e.currentTarget.value)
          }}
          value={email}
        />
      </Form.Item>

      <Form.Item
        label={getExpression('password')}
        rules={[
          {
            required: true,
            message: getExpression('enterYourPassword'),
          },
        ]}
      >
        <Input.Password
          onChange={e => {
            setPassword(e.currentTarget.value)
          }}
          value={password}
        />
      </Form.Item>

      <Form.Item valuePropName='checked'>
        <Checkbox checked={remember} onChange={() => setRemember(!remember)}>
          {getExpression('rememberMe')}
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit'>
          {getExpression('submit')}
        </Button>
      </Form.Item>
    </Form15rem>
  )
}

export default Login
