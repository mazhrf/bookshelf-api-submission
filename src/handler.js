const { nanoid } = require('nanoid')
const books = require('./books')

const bookExists = (id) => {
  return books.findIndex((book) => book.id === id)
}

const errorMessage = (code, status, action, h) => {
  const response = h.response({
    status: `${status}`,
    message: `${action}`
  })
  response.code(code)
  return response
}

const successMessage = (code, id, action, h) => {
  const response = h.response({
    status: 'success',
    message: `${action}`,
    data: {
      bookId: id
    }
  })
  response.code(code)
  return response
}

const addBooksHandler = (req, h) => {
  try {
    const {
      name, year, author, summary,
      publisher, pageCount, readPage, reading
    } = req.payload
    if (name === undefined) {
      return errorMessage(400, 'fail',
        'Gagal menambahkan buku. Mohon isi nama buku', h)
    }
    if (readPage > pageCount) {
      return errorMessage(400, 'fail',
        'Gagal menambahkan buku.' +
          ' readPage tidak boleh lebih besar dari pageCount', h)
    }
    const id = nanoid(16)
    const insertedAt = new Date().toISOString()
    const updatedAt = insertedAt
    const finished = (pageCount === readPage)
    const newbook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt
    }
    books.push(newbook)
    const isSuccess = bookExists(id) !== -1
    if (isSuccess) {
      return successMessage(201, id, 'Buku berhasil ditambahkan', h)
    } else {
      return errorMessage(500, 'error', 'Buku gagal ditambahkan', h)
    }
  } catch (e) {
    return errorMessage(500, 'error', 'Buku gagal ditambahkan', h)
  }
}

const getAllBooksHandler = (req, h) => {
  const { name, reading, finished } = req.query
  const newBooks = []
  let filteredBooks = books
  if (name !== undefined) {
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().indexOf(name.toLowerCase()) !== -1)
  }
  if (reading !== undefined) {
    const isReading = reading === '1'
    filteredBooks = filteredBooks.filter((book) =>
      book.reading === isReading)
  }
  if (finished !== undefined) {
    const isFinished = finished === '1'
    filteredBooks = filteredBooks.filter((book) =>
      book.finished === isFinished)
  }
  filteredBooks.forEach((book) => {
    const { id, name, publisher } = book
    const newBook = { id, name, publisher }
    newBooks.push(newBook)
  })
  return {
    status: 'success',
    data: {
      books: newBooks
    }
  }
}

const getBookByIdHandler = (req, h) => {
  const { id } = req.params
  const book = books.filter((n) => n.id === id)[0]
  if (book !== undefined) {
    return {
      status: 'success',
      data: { book }
    }
  }
  return errorMessage(404, 'fail', 'Buku tidak ditemukan', h)
}

const editBookHandler = (req, h) => {
  const { id } = req.params
  const {
    name, year, author, summary,
    publisher, pageCount, readPage, reading
  } = req.payload
  if (name === undefined) {
    return errorMessage(400, 'fail',
      'Gagal memperbarui buku. Mohon isi nama buku', h)
  }
  if (readPage > pageCount) {
    return errorMessage(400, 'fail',
      'Gagal memperbarui buku.' +
        ' readPage tidak boleh lebih besar dari pageCount', h)
  }
  const finished = (pageCount === readPage)
  const updatedAt = new Date().toISOString()
  const index = bookExists(id)
  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt
    }
    return successMessage(200, id, 'Buku berhasil diperbarui', h)
  }
  return errorMessage(404, 'fail', 'Gagal memperbarui buku.' +
  ' Id tidak ditemukan', h)
}

const deleteBookHandler = (req, h) => {
  const { id } = req.params
  const index = bookExists(id)
  if (index !== -1) {
    books.splice(index, 1)
    return successMessage(200, id, 'Buku berhasil dihapus', h)
  }
  return errorMessage(404, 'fail', 'Buku gagal dihapus. Id tidak ditemukan', h)
}

module.exports = {
  addBooksHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookHandler,
  deleteBookHandler
}
