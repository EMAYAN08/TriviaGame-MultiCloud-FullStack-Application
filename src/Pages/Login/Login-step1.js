import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails
} from 'amazon-cognito-identity-js'

import './Login-step1.css'

function Login () {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  //   const [securityQuestionList, setSecurityQuestionList] = useState([])
  //   const [selectedQuestion, setSelectedQuestion] = useState('')
  //   const [securityAnswer, setSecurityAnswer] = useState('')
  //   const [loginSuccessfull, setLoginSuccessfull] = useState(false)

  const poolData = {
    UserPoolId: 'us-east-1_EJeogRyNW', // Your user pool id here
    ClientId: '2k2enmom1mknnqemla6e3guc53' // Your client id here
  }

  var userPool = new CognitoUserPool(poolData)

  const handleLoginStep1 = e => {
    e.preventDefault()

    // Create a new Cognito user
    const userData = {
      Username: email,
      Pool: userPool
    }

    const cognitoUser = new CognitoUser(userData)

    // Create authentication details
    const authenticationData = {
      Username: email,
      Password: password
    }
    const authenticationDetails = new AuthenticationDetails(authenticationData)

    // Initiate the authentication process
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: result => {
        console.log(result)
        console.log(result.getAccessToken().getJwtToken())
        localStorage.setItem('jwtToken', result.getAccessToken().getJwtToken())
        localStorage.setItem(
          'refreshToken',
          result.getRefreshToken().getToken()
        )
        const user_id = result.getAccessToken().decodePayload().sub
        console.log(user_id)
        localStorage.setItem(
          'userDetails',
          JSON.stringify({
            id: user_id,
            email: email,
            role: 'user'
          })
        )
        alert('Login was successful. You will now be asked to answer the security question')
        navigate('/login-step2')

        // Redirect to a success page or perform additional actions upon successful login
      },
      onFailure: error => {
        console.error('Login failed:', error)
        // Handle login error and provide appropriate feedback to the user
      }
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
              <h1>Login</h1>
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
              <button
                className='btn btn-success mt-2'
                onClick={handleLoginStep1}
              >
                Login
              </button>

              <div className='mt-3 d-flex justify-content-between'>
                <p
                  className='forgot-password'
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </p>
                <button
                  className='btn btn-outline-primary'
                  onClick={() => navigate('/login-admin')}
                >
                  Admin? Login here
                </button>
              </div>
              <div className='mt-3'>
                <p>OR</p>
                <button
                  className='btn btn-primary'
                  onClick={() => navigate('/registration-step1')}
                >
                  Register
                </button>
              </div>
            </div>

            {/* <button
              className='btn btn-secondary'
              
            >
              Forgot Password?
            </button>
            <div>
              <p className='mt-2'>OR</p>
              <button
                className='btn btn-primary'
                onClick={() => navigate('/login-admin')}
              >
                Admin Login
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
