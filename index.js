require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
//app.use(morgan('tiny'))
morgan.token("body", (req) => JSON.stringify(req.body))
app.use(morgan(":method :url :status :response-time ms - :res[content-length] :body"))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({error: "malformatted id"})
  } else if (error.name === "ValidationError") {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get("/api/persons", (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get("/info", (request, response, persons) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `)
})

app.get("/api/persons/:id", (request, response, next) => {

  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/*
const generateId = () => {
  return Math.floor(Math.random() * 100000)
} */

app.post("/api/persons", (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({error: "name or number missing"})
  } else if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({error: "name must be unique"})
  }

  const person = Person({
    name: body.name,
    number: body.number.toString(),
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true, context: "query"})
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))

})

app.use(errorHandler) //last loaded middleware

const PORT = process.env.PORT || 3001 // delete the || 3001 ?
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})