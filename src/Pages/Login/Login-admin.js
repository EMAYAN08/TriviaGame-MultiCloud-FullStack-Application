import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import {
//   CognitoUser,
//   CognitoUserPool,
//   AuthenticationDetails
// } from 'amazon-cognito-identity-js'

function LoginAdmin () {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  //   const [securityQuestionList, setSecurityQuestionList] = useState([])
  //   const [selectedQuestion, setSelectedQuestion] = useState('')
  //   const [securityAnswer, setSecurityAnswer] = useState('')
  //   const [loginSuccessfull, setLoginSuccessfull] = useState(false)

  // const poolData = {
  //   UserPoolId: 'us-east-1_EJeogRyNW', // Your user pool id here
  //   ClientId: '2k2enmom1mknnqemla6e3guc53' // Your client id here
  // }

  // var userPool = new CognitoUserPool(poolData)

  const handleLoginAdmin = async e => {
    e.preventDefault()
    try {
      const response = await fetch(
        'https://lw6gqibt30.execute-api.us-east-1.amazonaws.com/dev/admin-login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email, password: password })
        }
      )
      const jsonData = await response.json() // Parse the response as JSON
      if (jsonData.statusCode === 200) {
        localStorage.setItem('userDetails', JSON.stringify({ role: 'admin' }))
        alert('Admin login successful!')
        navigate('/admin/category')
      }
      // setTeams(jsonData.body)
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
    // Create a new Cognito user
  }

  return (
    <>
      <div className='container'>
        <div className='row justify-content-center mt-4'>
          <h1>Trivia Teams</h1>
        </div>
        <div className='row justify-content-center mt-4'>
          <div className='col-md-6'>
            <div className='card p-5 shadow '>
              <h1>Admin Login</h1>
              <form className='mt-5'>
                <div className='form-group'>
                  <label>Email address</label>
                  <input
                    type='email'
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    className='form-control mt-2 mb-4'
                    id='exampleInputEmail1'
                    aria-describedby='emailHelp'
                    placeholder='Enter email'
                  />
                </div>
                <div className='form-group'>
                  <label>Password</label>
                  <input
                    type='password'
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    className='form-control mt-2 mb-4'
                    id='password'
                    placeholder='Password'
                  />
                </div>

                {/* <ul className='my-5'>
                <li>Password must be of minimun 8 characters</li>
                <li>
                  Password must contain 1 Uppercase character, 1 Lowercase
                  character, 1 number and 1 special character.
                </li>
              </ul> */}
              </form>
              <button className='btn btn-success' onClick={handleLoginAdmin}>
                Login
              </button>
              <div>
                <button
                  className='btn btn-outline-primary mt-5'
                  onClick={() => navigate('/')}
                >
                  Are you a user? Login Here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginAdmin
