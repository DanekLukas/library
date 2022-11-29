import { Button, Checkbox, Form, Input, InputRef, Tabs } from 'antd'
import { LanguageContext } from '../contexts/LanguageContext'
import { UserContext } from '../contexts/UserContext'
import { getProperties } from '../utils'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useContext, useRef, useState } from 'react'

const Group = () => {
  const initUser = { first_name: '', surname: '', email: '' }

  type member = typeof initUser

  const initGroup = { group_name: '', created_by: 0 }

  type groupT = typeof initGroup

  const initGroupTypeNames = { group_name: '', user_type_name: '' }

  const initGroupType = Object.assign({ id_group: 0, actual: false }, initGroupTypeNames, {
    created_by: 0,
  })

  const groupTypeToShow = Object.keys(initGroupType)

  type groupType = typeof initGroupType

  const initMember = Object.assign({ id_user: 0, id_group: 0 }, initGroup, initUser)

  const [edited, setEdited] = useState(0)

  const [editing, setEditing] = useState('')

  const { getUser } = useContext(UserContext)

  const { getExpression, getLanguage } = useContext(LanguageContext)

  const toShow = Object.keys(initMember)

  const [adding, setAdding] = useState('')

  // const [page, setPage] = useState(0)
  const limitRef = useRef(10)
  const orderRef = useRef('id_group')
  const myId = parseInt(getUser().id)

  const [data, setData] = useState<{
    member: Record<number, Record<number, member>>
    group: Record<number, groupT>
  }>({ member: {}, group: {} })

  const [newGroup, setNewGroup] = useState('')

  const [group, setGroup] = useState<Record<number, groupType>>({})

  const addUserRef = useRef<InputRef>(null)

  const query = {
    member: gql`
      query View_member($offset: Int, $limit: Int, $order: String) {
        view_member(offset: $offset, limit: $limit, order: $order) { ${toShow.join(' ')} }
        view_group { ${groupTypeToShow.join(' ')} }
      }
    `,
  }

  const mutation = {
    insert: gql`
      mutation InsertGroup($name: String) {
        insertGroup(name: $name)
      }
    `,
    update: gql`
      mutation UpdateGroup($id: Int, $name: String) {
        updateGroup(id: $id, name: $name)
      }
    `,
    delete: gql`
      mutation UpdateGroup($where: whereId) {
        deleteGroup(where: $where)
      }
    `,
    actual: gql`
      mutation SetGroupAktualni($id: Int) {
        setGroupAktualni(id: $id)
      }
    `,
    register: gql`
      mutation Register($idGroup: Int, $lang: String, $email: String) {
        Register(id_group: $idGroup, lang: $lang, email: $email) {
          data
          error
          message
        }
      }
    `,
  }

  const [insertGroup] = useMutation(mutation.insert, {
    onError: error => {
      console.error(error.message)
    },
    onCompleted: () => {
      refetch()
    },
  })

  const [updateGroup] = useMutation(mutation.update, {
    onError: error => {
      console.error(error.message)
    },
    onCompleted: () => {
      refetch()
    },
  })

  const [deleteGroup] = useMutation(mutation.delete, {
    onError: error => {
      console.error(error.message)
    },
    onCompleted: () => {
      refetch()
    },
  })

  const [actualGroup] = useMutation(mutation.actual, {
    onError: error => {
      console.error(error.message)
    },
    onCompleted: () => {
      refetch()
    },
  })

  const [register] = useMutation(mutation.register, {
    onError: error => {
      console.error(error.message)
    },
    onCompleted: () => {
      refetch()
    },
  })

  const { loading, refetch } = useQuery(query.member, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    variables: {
      offset: 0, //page * limitRef.current,
      limit: limitRef.current,
      order: orderRef.current,
    },
    onCompleted: allData => {
      const viewData = allData.view_member.filter((itm: any) => itm.__typename === 'member')
      const member: Record<number, Record<number, member>> = {}
      const group: Record<number, groupT> = {}
      viewData.forEach((one: any) => {
        if (!member[one.id_group]) member[one.id_group] = {}
        member[one.id_group][one.id_user] = getProperties(one, initUser) as member
        group[one.id_group] = getProperties(one, initGroup) as groupT
      })
      setData({ member, group })

      const viewGroup = allData.view_group.filter((itm: any) => itm.__typename === 'a_group')

      const userType: Record<number, groupType> = {}
      viewGroup.forEach((one: any) => {
        userType[one.id_group] = getProperties(one, initGroupType) as groupType
      })
      setGroup(userType)
    },
  })

  return (
    <>
      {loading && <div className='loading'>{getExpression('loading')}</div>}
      <Tabs
        defaultActiveKey='1'
        items={[
          {
            label: getExpression('libraries'),
            key: '1',
            children: group && (
              <Form>
                <table>
                  <thead>
                    {Object.entries(initGroupTypeNames).map((one, idx) => (
                      <th key={idx} colSpan={2}>
                        {getExpression(one[0])}
                      </th>
                    ))}
                  </thead>
                  <tbody>
                    {Object.keys(group).map((key, idx) =>
                      group[parseInt(key)].created_by === myId ? (
                        <tr key={idx}>
                          <td>
                            <Form.Item>
                              <Checkbox
                                checked={group[parseInt(key)].actual}
                                disabled={false}
                                onChange={() => {
                                  actualGroup({ variables: { id: parseInt(key) } })
                                }}
                              />
                            </Form.Item>
                          </td>
                          <td>
                            {edited === parseInt(key) ? (
                              <Form.Item>
                                <Input
                                  type='text'
                                  value={editing}
                                  onChange={e => {
                                    setEditing(e.target.value)
                                  }}
                                />
                              </Form.Item>
                            ) : (
                              <Form.Item>
                                <Input
                                  type='text'
                                  value={group[parseInt(key)].group_name}
                                  disabled={edited !== parseInt(key)}
                                />
                              </Form.Item>
                            )}
                          </td>
                          <td>
                            {edited === parseInt(key) ? (
                              <Form.Item>
                                <Button
                                  type='primary'
                                  onClick={() => {
                                    updateGroup({ variables: { id: edited, name: editing } })
                                    group[parseInt(key)].group_name = editing
                                    setEdited(0)
                                  }}
                                >
                                  {getExpression('save')}
                                </Button>
                                <Button
                                  type='primary'
                                  onClick={e => {
                                    setEdited(0)
                                  }}
                                >
                                  {getExpression('cancel')}
                                </Button>
                              </Form.Item>
                            ) : (
                              <Form.Item>
                                <Button
                                  type='primary'
                                  onClick={e => {
                                    setEditing(group[parseInt(key)].group_name)
                                    setEdited(parseInt(key))
                                  }}
                                >
                                  {getExpression('edit')}
                                </Button>
                                <Button
                                  type='primary'
                                  onClick={() => {
                                    deleteGroup({
                                      variables: { where: { id: parseInt(key) } },
                                    })
                                  }}
                                >
                                  {getExpression('delete')}
                                </Button>
                              </Form.Item>
                            )}
                          </td>
                        </tr>
                      ) : (
                        <tr key={idx}>
                          <td>
                            <Form.Item>
                              <Checkbox
                                checked={group[parseInt(key)].actual}
                                disabled={false}
                                onChange={() => {
                                  actualGroup({ variables: { id: parseInt(key) } })
                                }}
                              />
                            </Form.Item>
                          </td>
                          {Object.entries(group[parseInt(key)])
                            .filter(itm => ['group_name', 'user_type_name'].includes(itm[0]))
                            .map((one, idn) => (
                              <td key={idn}>
                                <Input type='text' value={one[1] as string} disabled={true} />
                              </td>
                            ))}
                        </tr>
                      )
                    )}
                    <tr>
                      <td></td>
                      <td>
                        <Form.Item>
                          <Input
                            type='text'
                            value={newGroup}
                            disabled={false}
                            onChange={e => {
                              setNewGroup(e.target.value)
                            }}
                          />
                        </Form.Item>
                      </td>
                      <td colSpan={2}>
                        <Form.Item>
                          <Button
                            type='primary'
                            onClick={() => {
                              insertGroup({ variables: { name: newGroup } })
                              setNewGroup('')
                            }}
                          >
                            {getExpression('add')}
                          </Button>
                        </Form.Item>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Form>
            ),
          },
          {
            label: getExpression('members'),
            key: '2',
            children: data?.group && (
              <Form>
                <table>
                  {Object.keys(group).map((key, idx) => (
                    <>
                      <tr key={idx}>
                        <td colSpan={Object.keys(initUser).length}>
                          {group[key as any].group_name}
                        </td>
                      </tr>
                      {data?.member[key as any]!! &&
                        Object.keys(data!.member[key as any]).map((one, idn) => (
                          <tr key={idn}>
                            {Object.keys(initUser).map((itm, itn) => (
                              <td key={itn}>
                                {data!.member[key as any][one as any][itm as keyof typeof initUser]}
                              </td>
                            ))}
                            <td>
                              {group[key as any].created_by === myId &&
                                group[key as any].created_by !== parseInt(one) && (
                                  <Button type='primary'>{getExpression('remove')}</Button>
                                )}
                            </td>
                          </tr>
                        ))}
                      {group[key as any].created_by === myId &&
                        (adding === key ? (
                          <tr>
                            <td colSpan={Object.keys(initUser).length - 1}>
                              <Form.Item label={getExpression('email')}>
                                <Input type='text' ref={addUserRef} />
                              </Form.Item>
                            </td>
                            <td>
                              <Form.Item>
                                <Button
                                  type='primary'
                                  onClick={e => {
                                    const email = addUserRef.current?.input?.value || ''
                                    if (email?.trim() === '') return
                                    register({
                                      variables: {
                                        email: email,
                                        lang: getLanguage(),
                                        idGroup: group[key as any].id_group,
                                      },
                                    })
                                    setAdding('')
                                  }}
                                >
                                  {getExpression('add')}
                                </Button>
                              </Form.Item>
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan={Object.keys(initUser).length}>
                              <Form.Item>
                                <Button type='primary' onClick={e => setAdding(key)}>
                                  {getExpression('add')}
                                </Button>
                              </Form.Item>
                            </td>
                          </tr>
                        ))}
                    </>
                  ))}
                </table>
              </Form>
            ),
          },
        ]}
      />
    </>
  )
}

export default Group
