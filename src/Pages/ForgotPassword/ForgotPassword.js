import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails
} from 'amazon-cognito-identity-js'

function ForgotPassword () {
  const navigate = useNavigate()
  // const email = JSON.parse(localStorage.getItem('userDetails'))['email']
  const [step, setStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const poolData = {
    UserPoolId: 'us-east-1_EJeogRyNW', // Your user pool id here
    ClientId: '2k2enmom1mknnqemla6e3guc53' // Your client id here
  }

  var userPool = new CognitoUserPool(poolData)

  const handleForgotPasswordStep1 = e => {
    e.preventDefault()

    // Create a new Cognito user
    const userData = {
      Username: email,
      Pool: userPool
    }

    const cognitoUser = new CognitoUser(userData)

    cognitoUser.forgotPassword({
      onSuccess: function () {
        setStep(2)
        console.log('Password reset request initiated successfully')
      },
      onFailure: function (err) {
        console.error('Password reset request failed:', err)
      }
    })
  }

  const handleForgotPasswordStep2 = e => {
    e.preventDefault()

    const userData = {
      Username: email,
      Pool: userPool
    }

    const cognitoUser = new CognitoUser(userData)
    cognitoUser.confirmPassword(verificationCode, password, {
      onSuccess: function () {
        console.log('Password reset successful')
        navigate('/')
      },
      onFailure: function (err) {
        console.error('Password reset failed:', err)
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
              <h1>Forgot Password</h1>
              {step === 1 && (
                <>
                  <div className='mt-5'>
                    <label>Email:</label>
                    <input
                      type='email'
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      className='form-control mt-2 mb-4'
                      id='exampleInputEmail1'
                      // aria-describedby='emailHelp'
                      placeholder='Enter email'
                    />
                    <button
                      className='btn btn-primary mt-3'
                      onClick={handleForgotPasswordStep1}
                    >
                      Send email
                    </button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div>
                    {/* <h3>Please enter the verification code for password reset:</h3> */}
                    <form className='mt-5'>
                      <div className='form-group'>
                        <label>Verification Code:</label>
                        <input
                          type='number'
                          value={verificationCode}
                          onChange={event =>
                            setVerificationCode(event.target.value)
                          }
                          className='form-control mt-2 mb-4'
                          id='exampleInputEmail1'
                          // aria-describedby='emailHelp'
                          placeholder='Enter verification code'
                        />
                      </div>
                      <div className='form-group'>
                        <label>New Password</label>
                        <input
                          type='password'
                          value={password}
                          onChange={event => setPassword(event.target.value)}
                          className='form-control mt-2 mb-4'
                          id='password'
                          placeholder='New Password'
                        />
                      </div>
                      <button
                        className='btn btn-success'
                        onClick={handleForgotPasswordStep2}
                      >
                        Reset Password
                      </button>
                    </form>
                  </div>
                </>
              )}
              <div>
                <p
                  className='forgot-password mt-5'
                  onClick={() => navigate('/')}
                >
                  Go back to Login Page
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword
