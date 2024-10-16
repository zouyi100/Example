const express = require('express')
// const cors = require('cors');
const app = express()
const port = 8080

// for development
// app.use(cors());

app.get('/user', (req, res) => {
  const data = [{
    name: 'John Doe',
    age: 28,
    isStudent: true
  }]
  res.json(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})