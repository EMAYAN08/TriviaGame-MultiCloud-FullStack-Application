import React, { useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import axios from 'axios'

const userDetails = JSON.parse(localStorage.getItem('userDetails'))

function RegistrationStep2 () {
  const navigate = useNavigate()

  // const params = useParams()
  const location = useLocation()

  // navigate("/", {
  //   state: {

  //   }
  // })

  // const config = {
  //   headers: {
  //     'Access-Control-Allow-Origin': 'http://localhost:3000'
  //   }
  // }
  const user_id = location.state.user_id

  // const user_id = 'hhhhh'
  // const user_id = params['id']
  // console.log(params)
  // const user_email = location.email
  const [question1, setQuestion1] = useState('')
  const [answer1, setAnswer1] = useState('')
  const [question2, setQuestion2] = useState('')
  const [answer2, setAnswer2] = useState('')
  const [question3, setQuestion3] = useState('')
  const [answer3, setAnswer3] = useState('')

  const handleStoreQA = e => {
    e.preventDefault()

    const questionAnswerPairs = [
      {
        question: question1,
        answer: answer1
      },
      {
        question: question2,
        answer: answer2
      },
      {
        question: question3,
        answer: answer3
      }
    ]

    // const questionAnswerPairs = [
    //   {
    //     question: 'hello',
    //     answer: 'hello'
    //   },
    //   {
    //     question: 'hello',
    //     answer: 'hello'
    //   },
    //   {
    //     question: 'hello',
    //     answer: 'hello'
    //   }
    // ]

    const payload = {
      user_id,
      questionAnswerPairs
    }

    axios
      .post(
        'https://us-central1-serverless-project-392719.cloudfunctions.net/post_users_mfa_qa',
        payload
      )
      .then(response => {
        console.log(response)
        alert('Security questions and answers added successfuly!')
        navigate('/')
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <>
      <div>
        <div className='container'>
          <div className='row justify-content-center mt-3'>
            <h1>Trivia Teams</h1>
          </div>
          <div className='row justify-content-center'>
            <div className='col-md-6'>
              <div className='card p-5 shadow '>
                <h1>Two-factor Authentication</h1>
                <div className='container'>
                  <form onSubmit={handleStoreQA}>
                    <div className='form-group mt-3'>
                      <label>Question 1:</label>
                      <input
                        type='text'
                        className='form-control'
                        value={question1}
                        onChange={e => setQuestion1(e.target.value)}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Answer 1:</label>
                      <input
                        type='text'
                        className='form-control'
                        value={answer1}
                        onChange={e => setAnswer1(e.target.value)}
                      />
                    </div>
                    <div className='form-group mt-3'>
                      <label>Question 2:</label>
                      <input
                        type='text'
                        className='form-control'
                        value={question2}
                        onChange={e => setQuestion2(e.target.value)}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Answer 2:</label>
                      <input
                        type='text'
                        className='form-control'
                        value={answer2}
                        onChange={e => setAnswer2(e.target.value)}
                      />
                    </div>
                    <div className='form-group mt-3'>
                      <label>Question 3:</label>
                      <input
                        type='text'
                        className='form-control'
                        value={question3}
                        onChange={e => setQuestion3(e.target.value)}
                      />
                    </div>
                    <div className='form-group'>
                      <label>Answer 3:</label>
                      <input
                        type='text'
                        className='form-control'
                        value={answer3}
                        onChange={e => setAnswer3(e.target.value)}
                      />
                    </div>
                    <button type='submit' className='btn btn-primary mt-5'>
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegistrationStep2
