import { Amplify, Auth } from 'aws-amplify'

Amplify.configure({
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    // identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',

    // REQUIRED - Amazon Cognito Region
    region: 'us-east-1',

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    // identityPoolRegion: 'XX-XXXX-X',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_EJeogRyNW',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: '2k2enmom1mknnqemla6e3guc53',

    // OPTIONAL - Hosted UI configuration
    oauth: {
      domain: 'http://localhost:3000',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'http://localhost:3000/dashboard',
      //   redirectSignOut: 'http://localhost:3000/',
      responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
    }
  }
})

// You can get the current config object
const awsAmplifyConfig = Auth.configure()

export default awsAmplifyConfig
