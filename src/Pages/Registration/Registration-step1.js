import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js'
import { Amplify, Auth, Hub } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth'
// import awsAmplifyConfig from '../../aws-amplify-config'

function RegistrationStep1 () {
  const navigate = useNavigate()

  const poolData = {
    UserPoolId: 'us-east-1_EJeogRyNW', // Your user pool id here
    ClientId: '2k2enmom1mknnqemla6e3guc53' // Your client id here
  }
  var userPool = new CognitoUserPool(poolData)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState(0)
  const [user_id, setUserId] = useState('')
  const [username, setUserName] = useState('')

  const [registrationSuccessfull, setRegistrationSuccessfull] = useState(false)

  const handleRegistrationStep1 = e => {
    e.preventDefault()

    userPool.signUp(email, password, [], null, function (err, result) {
      if (err) {
        alert(err.message || JSON.stringify(err))
        return
      }
      setRegistrationSuccessfull(true)
      alert('Account created successfully')
      var cognitoUser = result.user
      console.log(result)
      setUserId(result.userSub)
      setUserName(result.username)
      console.log(cognitoUser)
    })
  }

  const handleGoogleLogin = e => {
    Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Google
    }).then(res => {
      console.log('RESPONSE FROM GOOGLE LOGIN', res)
    })
  }

  const handleVerifyCode = e => {
    var userData = {
      Username: email,
      Pool: userPool
    }

    var cognitoUser = new CognitoUser(userData)
    // Confirm the user's verification code
    cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
      console.log(result)
      alert(
        'Email verified Successfully. You will now be asked to add security question-answer for 2-factor authentication'
      )
      navigate('/registration-step2', {
        state: {
          email: username,
          user_id: user_id
        }
      })
    })
  }

  return (
    <>
      <div className='container'>
        <div className='row justify-content-center mt-3'>
          <h1>Trivia Teams</h1>
        </div>
        <div className='row justify-content-center mt-3'>
          <div className='col-md-6'>
            <div className='card p-5 py-4 shadow '>
              <h2>
                {!registrationSuccessfull
                  ? 'Registration'
                  : 'Registration SuccessFull!!'}
              </h2>
              {!registrationSuccessfull && (
                <>
                  <form className='mt-3'>
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

                    <ul className='mt-2 text-left'>
                      <li style={{ textAlign: 'left' }}>
                        Password must be of minimun 8 characters
                      </li>
                      <li style={{ textAlign: 'left' }}>
                        Password must contain 1 Uppercase character, 1 Lowercase
                        character, 1 number and 1 special character.
                      </li>
                    </ul>
                  </form>
                  <button
                    className='btn btn-success mt-2'
                    onClick={handleRegistrationStep1}
                  >
                    Register
                  </button>
                  <div className='d-flex justify-content-between mt-3'>
                    <button
                      className='btn btn-outline-success flex-grow-1 me-2'
                      onClick={() =>
                        Auth.federatedSignIn({
                          provider: CognitoHostedUIIdentityProvider.Facebook
                        })
                      }
                    >
                      Register with Facebook
                    </button>
                    <button
                      className='btn btn-outline-success flex-grow-1 ms-2'
                      onClick={handleGoogleLogin}
                    >
                      Register with Google
                    </button>
                  </div>
                  <p className='mt-4'>OR</p>
                  <div>
                    <button
                      className='btn btn-primary'
                      onClick={() => navigate('/')}
                    >
                      Already a member? Login
                    </button>
                  </div>
                </>
              )}

              {registrationSuccessfull && (
                <>
                  <h3 className='mt-5'>
                    Please check your email for verification code and enter it
                    in the below:
                  </h3>
                  <div className='form-group'>
                    <label>Verification Code</label>
                    <input
                      type='number'
                      value={verificationCode}
                      onChange={event =>
                        setVerificationCode(event.target.value)
                      }
                      className='form-control mt-2 mb-4'
                      id='exampleInputEmail1'
                      placeholder='Enter verification code'
                    />
                  </div>
                  <button
                    className='btn btn-success'
                    onClick={handleVerifyCode}
                  >
                    Verify Email
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegistrationStep1
