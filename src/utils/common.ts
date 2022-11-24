import { Form } from 'antd'
import styled from '@emotion/styled'

export const getProperties = (from: Object, choose: Object) =>
  Object.fromEntries(
    new Map(Object.entries(from).filter(itm => Object.keys(choose).includes(itm[0])))
  )

export const Form15rem = styled(Form)`
  & .ant-form-item-control-input-content {
    width: 15rem;
  }
`
