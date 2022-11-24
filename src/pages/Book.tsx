import { Button, Form, Input, InputRef } from 'antd'
import { Form15rem } from '../utils'
import { LanguageContext } from '../contexts/LanguageContext'
import { MessageContext } from '../contexts/MessageContext'
import { gql, useMutation } from '@apollo/client'
import { useContext, useRef } from 'react'

const Book = () => {
  const { Search } = Input
  const editRef: Record<string, any> = {
    name: useRef<InputRef>(null),
    authors: useRef<InputRef>(null),
    language: useRef<InputRef>(null),
    published: useRef<InputRef>(null),
    theme: useRef<InputRef>(null),
    metadata: useRef<InputRef>(null),
    isbn: useRef<InputRef>(null),
  }
  const isbn_find = useRef<InputRef>(null)

  const { getExpression } = useContext(LanguageContext)
  const { setMessage } = useContext(MessageContext)

  const mutation = {
    insertBook: gql`
      mutation Mutation(
        $name: String
        $authors: String
        $language: String
        $published: String
        $theme: String
        $metadata: String
        $isbn: String
      ) {
        insertBook(
          name: $name
          authors: $authors
          language: $language
          published: $published
          theme: $theme
          metadata: $metadata
          isbn: $isbn
        )
      }
    `,
  }

  const [insertBook] = useMutation(mutation.insertBook, {
    onError: (error: any) => {
      // console.warn(error.message)
      setMessage(error.message)
    },
    onCompleted: /*enterData*/ () => {
      setMessage(getExpression('completed'))
      // const got = processReturnData(enterData[`Enter${table}`])
      // if (got?.id > 0) {
      //   setSpecificInputValue('id', got.id)
      //   refetchData({ orderBy: 'id' })
      // } else {
      //   setMessage(getExpression('DataNotEntered'))
      // }
    },
  })

  const toDb = () => {
    const val: Record<string, string> = {}
    Object.keys(editRef).forEach(key => {
      val[key] = editRef[key].current?.input?.value
    })
    insertBook({
      variables: val,
    })
  }

  const ovi = (one: any, i: number) =>
    one.volumeInfo.industryIdentifiers[i].identifier === editRef.isbn.current!.input!.value

  const findISBN = async (event: any) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn_find.current!.input!.value}`
      )
      if (response !== undefined) {
        const value = await response.json()
        if (value) {
          if (value.totalItems === 0) return
          const itm =
            value.totalItems === 1
              ? value.items[0]
              : value.items.find((one: any) => ovi(one, 0) || ovi(one, 1))
          if (!itm) return
          editRef.name.current!.input!.value = itm.volumeInfo.title
          editRef.authors.current!.input!.value = itm.volumeInfo.authors.join(', ')
          editRef.language.current!.input!.value = itm.volumeInfo.language
          editRef.published.current!.input!.value = itm.volumeInfo.publishedDate
          // themeRef.current!.input!.value = itm.
          // metadataRef.current!.input!.value = itm.
          // editRef.isbns.current!.input!.value = `${itm.volumeInfo.industryIdentifiers[0].identifier},
          // ${itm.volumeInfo.industryIdentifiers[1].identifier}`
          editRef.isbn.current!.input!.value = itm.volumeInfo.industryIdentifiers
            .map((one: any) => one.identifier)
            .join(', ')
        }
      }
    } catch (error: any) {
      console.error(error.message())
    }
  }

  return (
    <Form15rem onFinish={toDb}>
      <Form.Item label='ISBN'>
        <Search name='input_isbn' ref={isbn_find} onSearch={findISBN} />
      </Form.Item>
      {Object.keys(editRef).map((key, idx) => (
        <Form.Item label={getExpression(key)} key={idx}>
          <Input ref={editRef[key]} />
        </Form.Item>
      ))}
      <Form.Item>
        <Button type='primary' htmlType='submit'>
          {getExpression('add')}
        </Button>
      </Form.Item>
    </Form15rem>
  )
}

export default Book
