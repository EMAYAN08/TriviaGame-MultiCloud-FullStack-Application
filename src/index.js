import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap.min.css'
// import {
//   CognitoUserPool,
//   CognitoUserAttribute,
//   CognitoUser
// } from 'amazon-cognito-identity-js'

// const axios = require('axios')

// axios.defaults.headers.common['Access-Control-Allow-Origin'] =
//   'http://localhost:3000'

const root = ReactDOM.createRoot(document.getElementById('root'))
// var AmazonCognitoIdentity = require('amazon-cognito-identity-js')
// root.require('amazon-cognito-identity')
root.render(<App />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
