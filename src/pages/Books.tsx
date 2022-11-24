import { Button, Input, InputRef } from 'antd'
import { LanguageContext } from '../contexts/LanguageContext'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useContext, useRef, useState } from 'react'

const Books = () => {
  const table = 'Book'
  const editRef: Record<string, any> = {
    name: useRef<InputRef>(null),
    authors: useRef<InputRef>(null),
    language: useRef<InputRef>(null),
    published: useRef<InputRef>(null),
    theme: useRef<InputRef>(null),
    metadata: useRef<InputRef>(null),
    isbn: useRef<InputRef>(null),
  }

  const filterRef: Record<string, any> = {
    whereName: useRef<InputRef>(null),
    whereAuthors: useRef<InputRef>(null),
    whereLanguage: useRef<InputRef>(null),
    wherePublished: useRef<InputRef>(null),
    whereTheme: useRef<InputRef>(null),
    whereMetadata: useRef<InputRef>(null),
    whereIsbn: useRef<InputRef>(null),
  }

  const { getExpression } = useContext(LanguageContext)

  const toShow = Object.keys(editRef)

  const [page, setPage] = useState(0)
  const limitRef = useRef(10)
  const orderRef = useRef('name')
  const [edit, setEdit] = useState(-1)

  const [data, setData] = useState<any[]>([])
  const [countAll, setCountAll] = useState(0)
  const query = {
    books: gql`
      query Query($offset: Int,
        $limit: Int,
        $order: String,
        $whereName: String,
        $whereAuthors: String,
        $whereLanguage: String,
        $wherePublished: String,
        $whereTheme: String,
        $whereMetadata: String,
        $whereIsbn: String) {
        findSome${table}s(offset: $offset,
          limit: $limit,
          order: $order,
          whereName: $whereName,
          whereAuthors: $whereAuthors,
          whereLanguage: $whereLanguage,
          wherePublished: $wherePublished,
          whereTheme: $whereTheme,
          whereMetadata: $whereMetadata,
          whereIsbn: $whereIsbn) {
            id ${toShow.join(' ')}}
        totalCount${table}s(whereName: $whereName,
          whereAuthors: $whereAuthors,
          whereLanguage: $whereLanguage,
          wherePublished: $wherePublished,
          whereTheme: $whereTheme,
          whereMetadata: $whereMetadata,
          whereIsbn: $whereIsbn)
      }
    `,
  }

  const mutation = {
    upravy: gql`
    mutation updateItem($id: Int, ${toShow.map(item => `$${item}: String`).join(', ')}) {
      update${table}(id: $id, ${toShow.map(item => `${item}: $${item}`).join(', ')})
    }
  `,
    smaz: gql`
    mutation deleteItem($where: whereId) {
      delete${table}(where: $where)
  }
`,
  }

  const [updateItem] = useMutation(mutation.upravy, {
    onError: error => {
      console.error(error.message)
    },
    onCompleted: ItemData => {
      // processReturnData(ItemData[`Update${table}`])
      reload()
    },
  })

  const reload = () => {
    refetch({
      offset: page * limitRef.current,
      limit: limitRef.current,
      order: orderRef.current,
      whereName: filterRef.whereName?.current?.input.value || '',
      whereAuthors: filterRef.whereAuthors?.current?.input.value || '',
      whereLanguage: filterRef.whereLanguage?.current?.input.value || '',
      wherePublished: filterRef.wherePublished?.current?.input.value || '',
      whereTheme: filterRef.whereTheme?.current?.input.value || '',
      whereMetadata: filterRef.whereMetadata?.current?.input.value || '',
      whereIsbn: filterRef.whereIsbn?.current?.input.value || '',
    })
  }

  const update = (id: number) => {
    updateItem({
      variables: (() => {
        const val: Record<string, any> = { id: id }
        toShow.forEach(key => (val[key] = editRef[key]!.current!.input.value))
        return val
      })(),
    })
  }

  const [deleteItem] = useMutation(mutation.smaz, {
    onError: error => {
      console.error(error.message)
    },
    onCompleted: () => {
      reload()
    },
  })

  const handleDelete = (id: number) => {
    deleteItem({ variables: { where: { id: id } } })
  }

  const { loading, refetch } = useQuery(query.books, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    variables: {
      offset: page * limitRef.current,
      limit: limitRef.current,
      order: orderRef.current,
      whereName: '',
      whereAuthors: '',
      whereLanguage: '',
      wherePublished: '',
      whereTheme: '',
      whereMetadata: '',
      whereIsbn: '',
    },
    onCompleted: allData => {
      const books = allData.findSomeBooks.filter((itm: any) => itm.__typename === 'book')
      setCountAll(allData.totalCountBooks)
      setData(
        books.map((itm: any) =>
          (() => {
            const val: Record<string, any> = {}
            toShow.concat(['id']).forEach(key => (val[key] = itm[key]))
            return val
          })()
        )
      )
    },
  })

  return (
    <>
      {loading && <div className='loading'>{getExpression('loading')}</div>}
      {data && data.length > 0 && (
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {toShow.map((itm, ind) => (
                <th key={ind}>{getExpression(itm)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((line, idx) => (
              <tr key={idx}>
                {toShow.map((itm, ind) => (
                  <td
                    key={ind}
                    style={
                      edit === idx
                        ? { padding: 0 }
                        : {
                            padding: 4,
                            borderTop: '1px solid lightgray',
                            borderBottom: '1px solid lightgray',
                          }
                    }
                  >
                    {edit === idx ? (
                      <Input defaultValue={line[itm]} ref={editRef[itm as keyof typeof editRef]} />
                    ) : (
                      line[itm]
                    )}
                  </td>
                ))}
                <td>
                  {edit === idx ? (
                    <>
                      <Button
                        onClick={event => {
                          setEdit(-1)
                        }}
                      >
                        {getExpression('cancel')}
                      </Button>
                      <Button
                        onClick={event => {
                          update(data[idx].id)
                          setEdit(-1)
                        }}
                      >
                        {getExpression('save')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        disabled={edit !== -1}
                        onClick={event => {
                          setEdit(idx)
                        }}
                      >
                        {getExpression('edit')}
                      </Button>
                      <Button
                        disabled={edit !== -1}
                        onClick={event => {
                          handleDelete(data[idx].id)
                        }}
                      >
                        {getExpression('remove')}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              {Object.keys(filterRef).map((itm, ind) => (
                <th key={ind}>
                  <Input type='text' ref={filterRef[itm]} />
                </th>
              ))}
              <th>
                <Button
                  onClick={() => {
                    Object.keys(filterRef).forEach(key => {
                      filterRef[key]!.current!.input.value = ''
                    })
                    reload()
                  }}
                >
                  {getExpression('clear')}
                </Button>
                <Button
                  onClick={() => {
                    reload()
                  }}
                >
                  {getExpression('filter')}
                </Button>
              </th>
            </tr>
            <tr>
              <td colSpan={toShow.length}>
                {' '}
                {(() => {
                  const cnt = Math.ceil(countAll / limitRef.current)
                  const ret = []
                  for (let i = 1; i <= cnt; i++)
                    ret.push(
                      <div
                        key={i}
                        className={['page', page + 1 === i ? 'bold' : 'underline'].join(' ')}
                        onClick={() => {
                          setPage(i - 1)
                          reload()
                        }}
                      >
                        {i}
                      </div>
                    )
                  return <div className='paginator'>{ret}</div>
                })()}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </>
  )
}

export default Books
