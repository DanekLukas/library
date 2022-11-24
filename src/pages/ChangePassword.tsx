import { Button, Form, Input, Tabs } from 'antd'
import { Form15rem } from '../utils'
import { LanguageContext } from '../contexts/LanguageContext'
import { MessageContext } from '../contexts/MessageContext'
import { UserContext } from '../contexts/UserContext'
import { getProperties } from '../utils'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useContext, useState } from 'react'

const ChangePassword = () => {
  const userProperties = ['first_name', 'surname', 'address', 'city', 'code', 'state']

  const initUser = Object.fromEntries(userProperties.map(key => [key, '']))

  const query = {
    getUserName: gql`
      query User($id: Int!) {
        user(id: $id) { ${userProperties.join(' ')} }
      }
    `,
  }

  const mutations = {
    setPassword: gql`
      mutation SetPassword($password: String, $newPassword: String) {
        SetPassword(password: $password, newPassword: $newPassword) {
          error
          data {
            id
            email
          }
          message
        }
      }
    `,
    updateUser: gql`
      mutation Mutation(
        $first_name: String
        $surname: String
        $address: String
        $code: String
        $city: String
        $state: String
      ) {
        updateSelf(
          first_name: $first_name
          surname: $surname
          address: $address
          code: $code
          city: $city
          state: $state
        )
      }
    `,
  }

  const [originalPassword, setOriginalPassword] = useState('')
  const [password, setPassword] = useState('')
  const [checkPassword, setCheckPassword] = useState('')
  const [user, setUser] = useState<typeof initUser>()
  const { getUser } = useContext(UserContext)
  const [edit, setEdit] = useState(false)

  const { getExpression } = useContext(LanguageContext)
  const { setMessage } = useContext(MessageContext)

  const myId = parseInt(getUser().id)

  const { loading, refetch } = useQuery(query.getUserName, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    variables: { id: myId },
    onCompleted: allData => {
      setUser(getProperties(allData.user, initUser) as typeof initUser)
    },
  })

  const [userMutation] = useMutation(mutations.updateUser, {
    onError: error => {
      setMessage(error.message)
    },
    onCompleted: data => {
      if (data.updateSelf?.error === 0) {
        setMessage(getExpression('passwordChanged'))
        setOriginalPassword('')
        setPassword('')
        setCheckPassword('')
      } else {
        setMessage(getExpression(data.SetPassword?.message))
      }
    },
  })

  const update = () => {
    userMutation({ variables: user })
    setEdit(false)
  }

  const [passwordMutation] = useMutation(mutations.setPassword, {
    onError: error => {
      setMessage(error.message)
    },
    onCompleted: data => {
      if (data.SetPassword?.error === 0) {
        setMessage(getExpression('passwordChanged'))
        setOriginalPassword('')
        setPassword('')
        setCheckPassword('')
      } else {
        setMessage(getExpression(data.SetPassword?.message))
      }
    },
  })

  const cancelUpdate = (e: { preventDefault: () => void }) => {
    refetch({ id: myId })
    setEdit(false)
    e.preventDefault()
  }

  const onFinish = () => {
    try {
      if (password !== checkPassword) {
        throw new Error('passwordDiffers')
      }
      if (password.length < 6) {
        throw new Error('passwordTooShort')
      }
      if (password.match(/\s/g) !== null) {
        throw new Error('password')
      }
      passwordMutation({
        variables: {
          password: originalPassword,
          newPassword: password,
        },
      })
    } catch (e: any) {
      setMessage(getExpression(e.getMessage()))
    }
  }

  return (
    <>
      {loading && <div className='loading'>{getExpression('loading')}</div>}
      <Tabs
        defaultActiveKey='1'
        items={[
          {
            label: getExpression('password'),
            key: '1',
            children: (
              <Form15rem onFinish={onFinish}>
                <Form.Item
                  label={getExpression('password')}
                  rules={[
                    {
                      required: true,
                      message: getExpression('enterPassword'),
                    },
                  ]}
                >
                  <Input.Password
                    value={originalPassword}
                    onChange={e => setOriginalPassword(e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  label={getExpression('newPassword')}
                  rules={[
                    {
                      required: true,
                      message: getExpression('enterPassword'),
                    },
                  ]}
                >
                  <Input.Password value={password} onChange={e => setPassword(e.target.value)} />
                </Form.Item>

                <Form.Item
                  label={getExpression('checkPassword')}
                  rules={[
                    {
                      required: true,
                      message: getExpression('enterPassword'),
                    },
                  ]}
                >
                  <Input.Password
                    value={checkPassword}
                    onChange={e => setCheckPassword(e.target.value)}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type='primary' htmlType='submit'>
                    {getExpression('save')}
                  </Button>
                </Form.Item>
              </Form15rem>
            ),
          },
          {
            label: getExpression('personal'),
            key: '2',
            children: (
              <Form15rem onFinish={update}>
                {user &&
                  userProperties.map((key, idx) => (
                    <Form.Item key={idx} label={getExpression(key)}>
                      <Input
                        type='text'
                        value={user[key]}
                        onChange={({ target: { value } }) => {
                          const tmp = { ...user }
                          tmp[key] = value
                          setUser(tmp)
                        }}
                        disabled={!edit}
                      />
                    </Form.Item>
                  ))}
                {edit ? (
                  <Form.Item>
                    <Button type='primary' htmlType='submit'>
                      {getExpression('save')}
                    </Button>
                    <Button type='primary' onClick={cancelUpdate}>
                      {getExpression('cancel')}
                    </Button>
                  </Form.Item>
                ) : (
                  <Form.Item>
                    <Button
                      type='primary'
                      onClick={e => {
                        setEdit(true)
                        e.preventDefault()
                      }}
                    >
                      {getExpression('edit')}
                    </Button>
                  </Form.Item>
                )}
              </Form15rem>
            ),
          },
        ]}
      />
    </>
  )
}

export default ChangePassword
