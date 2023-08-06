import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import LoginStep1 from './Pages/Login/Login-step1'
import LoginStep2 from './Pages/Login/Login-step2'
import RegistrationStep1 from './Pages/Registration/Registration-step1'
import RegistrationStep2 from './Pages/Registration/Registration-step2'
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword'
import MyTeams from './Pages/MyTeams/MyTeams'
import LoginAdmin from './Pages/Login/Login-admin'
import AddGame from './Pages/Admin/AddGame'
import FilterGame from './Pages/Admin/FilterGame'
import AnalyzeGameData from './Pages/Admin/AnalyzeGameData'
import { Amplify, Auth, Hub } from 'aws-amplify'
import AddQuestions from './Pages/Admin/AddQuestions'
import FilterQuestions from './Pages/Admin/FilterQuestions'
import Category from './Pages/Admin/Category'
import TriviaTable from './Pages/Lobby/TriviaTable'
import Leaderboard from './Pages/LeaderBoard/LeaderBoard'
import InGame from './Pages/InGame/InGame'

import React, { useState, useEffect } from 'react';
import UserProfile from './Pages/UserProfile/UserProfile';
import LexChat from './Components/lexChat';
import 'bootstrap/dist/css/bootstrap.min.css';


Amplify.configure({
  Auth: {
    region: 'us-east-1',

    userPoolId: 'us-east-1_EJeogRyNW',

    userPoolWebClientId: '2k2enmom1mknnqemla6e3guc53',
    oauth: {
      domain: 'trivia-titans123.auth.us-east-1.amazoncognito.com',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'https://sdp-14-6tdcine2na-uc.a.run.app/trivialobby',
      //   redirectSignOut: 'http://localhost:3000/',
      responseType: 'token'
    }
  }
})

const router = createBrowserRouter([
  {
    element: <LoginStep1 />,
    path: '/'
  },
  {
    element: <LoginStep2 />,
    path: '/login-step2'
  },
  {
    element: <LoginAdmin />,
    path: '/login-admin'
  },

  {
    element: <RegistrationStep1 />,
    path: '/registration-step1'
    // children: [
    //   {
    //     paths: ['/', '/registration-step1'],
    //     element: <RegistrationStep1 />
    //   }
    // ]
  },
  {
    element: <RegistrationStep2 />,
    path: '/registration-step2'
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/my-teams',
    element: <MyTeams />
  },
  {
    path: '/admin/category',
    element: <Category />
  },
  {
    path: '/admin/add-questions',
    element: <AddQuestions />
  },
  {
    path: '/admin/filter-questions',
    element: <FilterQuestions />
  },
  {
    path: '/admin/add-game',
    element: <AddGame />
  },
  {
    path: '/admin/filter-game',
    element: <FilterGame />
  },
  {
    path: '/trivialobby',
    element: <TriviaTable />
  },
  {
    path: '/leaderboard',
    element: <Leaderboard />
  },
  {
    path: '/user',
    element: <UserProfile />
  },
  {
    path: '/ingame',
    element: <InGame />
  },
  {
    path: '/admin/analyze-gameplay',
    element: <AnalyzeGameData />
  },
  {
    path: '/ingame',
    element: <InGame />
  }
])

function App() {

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload: { event, data } }) => {
      console.log('event from hub', event)
      console.log('data from hub', data)
    })

    Auth.currentAuthenticatedUser()
      .then(currentUser => {
        const headers = new Headers()
        headers.append(
          'Authorization',
          `Bearer ${currentUser.signInUserSession.accessToken.jwtToken}`
        )
        fetch(
          'https://trivia-titans123.auth.us-east-1.amazoncognito.com/oauth2/userInfo',
          {
            method: 'GET',
            headers: headers
          }
        ).then(response => {
          if (!response.ok) {
            console.log('Something went wrong!')
            return response.json().then(errorData => {
              console.log(errorData)
            })
          } else {
            return response.json().then(data => {
              console.log('data inside curretn Authenticated user: ', data)
              const email = data.email,
                id = data.sub
              localStorage.setItem(
                'userDetails',
                JSON.stringify({
                  email: email,
                  id: id,
                  role: 'user'
                })
              )
              // let email = data.data
            })
          }
        })
      })
      .catch(() => {
        // Auth.signOut({ global: true })
        // localStorage.clear()
      })

    // return unsubscribe
  }, [])
  return (
    <div className='App'>
      <RouterProvider router={router} />
      <LexChat />
    </div>
  )
}

export default App
