import { Button, Form, Input } from 'antd'
import { Form15rem } from '../utils'
import { LanguageContext } from '../contexts/LanguageContext'
import { MessageContext } from '../contexts/MessageContext'
import { gql, useMutation } from '@apollo/client'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import isEmail from 'validator/lib/isEmail'

const mutation = {
  resetpassword: gql`
    mutation resetPassword($email: String, $lang: String) {
      Resetpassword(email: $email, lang: $lang) {
        error
        data
        message
      }
    }
  `,
}

const ForgottenPassword = () => {
  const navigate = useNavigate()
  const { getExpression, getLanguage } = useContext(LanguageContext)
  const [email, setEmail] = useState('')

  const { setMessage } = useContext(MessageContext)

  const [resetPasswordMutation] = useMutation(mutation.resetpassword, {
    onError: error => {
      console.error(error)
    },
    onCompleted: data => {
      if (data.Resetpassword.error) {
        setMessage(getExpression(data.Resetpassword.message))
      } else {
        navigate('/login')
      }
    },
  })

  const onFinish = () => {
    if (!isEmail(email)) {
      setMessage(getExpression('notValidEmail'))
      return
    }
    resetPasswordMutation({
      variables: {
        email,
        lang: getLanguage(),
      },
    })
    setMessage(getExpression('emailSentForReset').replace('__email__', email))
    return
  }

  const onFinishFailed = () => {
    return
  }

  return (
    <>
      <Form15rem
        name='basic'
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete='off'
      >
        <Form.Item
          label={getExpression('email')}
          rules={[
            {
              required: true,
              message: getExpression('enterEmail'),
            },
          ]}
        >
          <Input onChange={e => setEmail(e.target.value)} value={email} />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            {getExpression('submit')}
          </Button>
        </Form.Item>
      </Form15rem>
    </>
  )
}

export default ForgottenPassword
