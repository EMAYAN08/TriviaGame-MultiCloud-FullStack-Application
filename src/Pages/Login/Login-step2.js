import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function LoginStep2 () {
  const [questionList, setQuestionList] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const user_id = JSON.parse(localStorage.getItem('userDetails'))['id']
  const navigate = useNavigate();

  useEffect(() => {
    console.log(JSON.parse(localStorage.getItem('userDetails')))
    const fetchQuestionList = () => {
      // console.log('id' + user_id)
      axios
        .post(
          'https://us-central1-serverless-project-392719.cloudfunctions.net/get_users_mfa_questions',
          { user_id: user_id }
        )
        .then(response => {
          console.log(response)
          setQuestionList(response.data.question_list)
        })
        .catch(error => {
          console.log(error)
        })
      // Process the response data
    }

    fetchQuestionList()
  }, [])

  const handleQuestionChange = e => {
    setSelectedQuestion(e.target.value)
  }

  const handleAnswerChange = e => {
    setAnswer(e.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    // Handle form submission
    console.log('Selected Question:', selectedQuestion)
    console.log('Answer:', answer)

    axios
      .post(
        'https://us-central1-serverless-project-392719.cloudfunctions.net/validate_mfa_qa',
        {
          user_id: user_id,
          question: selectedQuestion,
          answer: answer
        }
      )
      .then(response => {
        console.log(response)
        if (response.data.valid_qa === true) {
          alert('Two-factor authentication successfull.')
          navigate('/trivialobby')
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <>
      <div className='container'>
        <div className='row justify-content-center mt-4'>
          <h1>Trivia Teams</h1>
        </div>
        <div className='row justify-content-center mt-3'>
          <div className='col-md-6'>
            <div className='card p-5 shadow '>
              <h1 className='mb-4'>Security Questions and Answers</h1>
              <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                  <label htmlFor='question' className='form-label'>
                    Select a Question:
                  </label>
                  <select
                    className='form-select'
                    id='question'
                    value={selectedQuestion}
                    onChange={handleQuestionChange}
                  >
                    <option value=''>Select a question</option>
                    {questionList?.map(question => (
                      <option key={question} value={question}>
                        {question}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='mb-3'>
                  <label htmlFor='answer' className='form-label'>
                    Answer:
                  </label>
                  <input
                    type='text'
                    className='form-control'
                    id='answer'
                    value={answer}
                    onChange={handleAnswerChange}
                  />
                </div>
                <button type='submit' className='btn btn-primary'>
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginStep2
