const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log("give a password as argument")
  process.exit()
}

const password = process.argv[2]

const url = `mongodb+srv://arttutjpesonen:${password}@cluster0.5s3e8sb.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set("strictQuery", false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model("Person", personSchema) 

if (process.argv.length === 5) {  //adding a new person
  
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(result => {
    console.log("person saved")
    mongoose.connection.close()
  })


} else if (process.argv.length === 3) { //showing all persons
  console.log("phonebook:")

  Person
    .find({})
    .then(result => {
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
}

