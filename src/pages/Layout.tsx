import { Form, Layout, Menu, Select, Typography } from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { LanguageContext } from '../contexts/LanguageContext'
import { MessageContext } from '../contexts/MessageContext'
import { ReactNode, useContext } from 'react'
import { UserContext } from '../contexts/UserContext'
import { useNavigate } from 'react-router-dom'

type Props = {
  children: ReactNode
  menu: string[]
}

const Library = ({ children, menu }: Props) => {
  const navigate = useNavigate()
  const { Title } = Typography
  const { Header, Content, Footer, Sider } = Layout
  const { getExpression, getLanguageTypes, setLanguage, getLanguage, getLanguages } =
    useContext(LanguageContext)
  const { getUser, logoutUser } = useContext(UserContext)
  const { messages } = useContext(MessageContext)
  const { Option } = Select

  return (
    <div className='all'>
      <Layout>
        <Header>
          <Title>{getExpression('Library')}</Title>
          <Form>
            <Form.Item
              label={getExpression('Language')}
              rules={[
                {
                  required: true,
                  message: getExpression('ChooseLanguage'),
                },
              ]}
            >
              <Select
                defaultValue={getLanguage()}
                onChange={e => {
                  setLanguage(e.valueOf())
                }}
              >
                {getLanguageTypes().map((option, index) => (
                  <Option key={index} value={option}>
                    {getLanguages()[option]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
          <div className='messages'>
            {Object.keys(messages)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((key, index) => (
                <div key={index}>{messages[parseInt(key) as keyof typeof messages]}</div>
              ))}
          </div>
        </Header>
        <Layout>
          <Sider>
            <Menu
              items={((menu: ItemType[]) => {
                return getUser().id === ''
                  ? menu
                  : menu.concat([
                      {
                        label: getExpression('logout'),
                        key: -1,
                        onClick: logoutUser,
                      },
                    ])
              })(
                menu.map((itm, idx) => ({
                  label: getExpression(itm),
                  key: idx,
                  onClick: () => navigate(`/${itm}`),
                }))
              )}
              mode='vertical'
              defaultSelectedKeys={[getUser().id === '' ? '0' : '1']}
            />
          </Sider>
          <Content style={{ paddingLeft: '1rem' }}>{children}</Content>
        </Layout>
        <Footer></Footer>
        <div className='by'>© Lukáš Daněk</div>
      </Layout>
    </div>
  )
}
export default Library
