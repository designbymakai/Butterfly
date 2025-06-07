require('dotenv').config()
const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Project': process.env.OPENAI_PROJECT_ID
        }
      }
    )
    res.json(response.data)
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('OpenAI API error:', JSON.stringify(err.response.data, null, 2))
      res.status(err.response.status).json({ error: err.response.data })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
