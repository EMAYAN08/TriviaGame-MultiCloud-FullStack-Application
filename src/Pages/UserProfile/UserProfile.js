import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
// import Form from 'react-bootstrap/Form'
import { Form } from 'react-bootstrap'
import { Configuration, OpenAIApi } from 'openai'
import Select from 'react-select'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { EmailRounded } from '@mui/icons-material'
import Header from '../../Components/Header/Header'

const userDetails = JSON.parse(localStorage.getItem('userDetails'))

const UserProfile = () => {
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [userAddress, setUserAddress] = useState(" ")
  const [userPhoneNumber, setUserPhoneNumber] = useState(" ")
  const [profilePicture, setProfilePicture] = useState(null);
  const [userMetrics, setUserMetrics] = useState(null)
  const [userAcments, setUserAcments] = useState(null)
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePictureBase64, setProfilePictureBase64] = useState('');
  const [options, setOptions] = useState([])
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false)
  const [PromoteToAdminMember, setPromoteToAdminMember] = useState(null)
  const [showUserProfile, setShowPromoteToAdminModal] = useState(false)
  const [generatedName, setGeneratedName] = useState('')
  // const [selectedMember, setSelectedMember] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  // const [newMember, setNewMember] = useState(null)
  const [selectedTeamForModal, setSelectedTeamForModal] = useState(null)
  const [filteredMembersOfTeam, setFilteredMembersOfTeam] = useState([])
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [memberToPromote, setMemberToPromote] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPP, setIsSubmittingPP] = useState(false);
  const [selectedCompareUserId, setSelectedCompareUserId] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState(null)

  // const [MembersSelected, setMembersSelected] = useState(false)

  const getUserProfile = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('userDetails')).id;
      console.log("user id ", userId)
      const response = await fetch(
        'https://7tnancjd1l.execute-api.us-east-1.amazonaws.com/prod/getuserprofile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: userId})
        }
      )
      const jsonData = await response.json()
      console.log(jsonData)
      const body =  JSON.parse(jsonData['body'])
       // Parse the response as JSON
      setUserAddress(body['user_address'])
      setUserPhoneNumber(body['user_phone_number'])
      setUserName(body['user_id'])
      setEmail(body['email'])
      if (body['user_profile_picture']) {
        setProfilePictureBase64(body['user_profile_picture']);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }

  const getUserStats = async () => {
    try {
      const userId = "test"
      console.log("user id ", userId)
      const response = await fetch(
        'https://7tnancjd1l.execute-api.us-east-1.amazonaws.com/prod/getstats',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: userId})
        }
      )
      const jsonData = await response.json()
      console.log(jsonData)
      const body =  JSON.parse(jsonData['body'])
       // Parse the response as JSON
      const userMetricsTemp = {}
      userMetricsTemp['sum'] = body['metrics']['sum']
      userMetricsTemp['count'] = body['metrics']['count']
      userMetricsTemp['avg'] = body['metrics']['avg']
      userMetricsTemp['max'] = body['metrics']['max']
      userMetricsTemp['min'] = body['metrics']['min']
      setUserMetrics(userMetricsTemp)
      const userAcmentsTemp = {}
      userAcmentsTemp['games_played'] = body['acments']['games_played']
      userAcmentsTemp['score'] = body['acments']['score']
      setUserAcments(userAcmentsTemp)
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }

  const getUsersList = async () => {
    try {
      
      const response = await fetch(
        'https://7tnancjd1l.execute-api.us-east-1.amazonaws.com/prod/getallusers',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      )
      const jsonData = await response.json()
      console.log(jsonData)
      const body =  JSON.parse(jsonData['body'])
      console.log("body is user list ", body)
       // Parse the response as JSON
       const optionsTemp = [];
       for (const userDetail of body) {
         optionsTemp.push(userDetail.email);
       }
       setOptions(optionsTemp);
        
      
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }



  useEffect(() => {
    getUserProfile();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'userPhoneNumber') {
      setUserPhoneNumber(value);
    } else if (name === 'userAddress') {
      setUserAddress(value);
    }
    setIsSubmitting(true); // Enable submit button when input changes
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    setProfilePicture(file);
    setProfilePictureFile(URL.createObjectURL(file));
     const reader = new FileReader();
    reader.onload = () => {
      setProfilePictureBase64(reader.result);
    };
    reader.readAsDataURL(file);
    setIsSubmittingPP(true);
  };

  const handleCompareClick = () => {
    setIsComparing(true);
    getUsersList()
  };

  const handleCompareWithUsers =  async () => {
    if (selectedCompareUserId) {
      const userId = "test"
      const compareUrl = "https://7tnancjd1l.execute-api.us-east-1.amazonaws.com/prod/compareusers"
      const response = await fetch(
        compareUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_one_id: userId, user_two_id:selectedCompareUserId})
        }
      )
      const jsonData = await response.json()
      const payload = jsonData['body']
      const payloadJson = await JSON.parse(payload)
      setCompareResult(payloadJson)
      console.log("payloa djson", payloadJson)
      console.log("Selected User ID to Compare With:", selectedCompareUserId);
    }
  };

  const handleSubmit = async () => {

    const updateUrl = "https://7tnancjd1l.execute-api.us-east-1.amazonaws.com/prod/updateuserprofile"
    const payload = {
      user_id: userName,
      user_address: userAddress,
      user_phone_number: userPhoneNumber
    };
    if(isSubmittingPP){
      payload['profile_picture'] = profilePictureBase64
    }

    try {
      const response = await fetch(updateUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        getUserProfile();
      } else {
        console.error('Error updating user profile:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating user profile:', error.message);
    }

  
    setIsSubmitting(false);
    setIsSubmittingPP(false);
  };


  return (
    <div>
       <Header />
      <h2> User Profile</h2>
      <Form>
      <Form.Group controlId="userID">
          <Form.Label>UserName</Form.Label>
          <Form.Control type="email" value={userName} readOnly />
        </Form.Group>
        <Form.Group controlId="userEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} readOnly />
        </Form.Group>
        <Form.Group controlId="userPhoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            name="userPhoneNumber"
            value={userPhoneNumber}
            onChange={handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="userAddress">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            name="userAddress"
            value={userAddress}
            onChange={handleInputChange}
          />
           {profilePictureBase64 && (
          <img
            src={profilePictureBase64}
            alt="Profile"
            style={{ maxWidth: '100px' }} // Adjust the style as needed
          />
        )}
        </Form.Group>
        <Form.Group controlId="userProfilePicture">
        <Form.Label>Profile Picture</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleProfilePictureChange}
        />
        {profilePictureFile && <p>Selected: {profilePictureFile.name}</p>}
      </Form.Group>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isSubmittingPP && !isSubmitting}
        >
          Update
        </Button>
      </Form>

      <hr style={{ margin: '20px 0' }} />

      <Button variant="primary" onClick={getUserStats}>
      Get User Stats
    </Button>



      {userMetrics !== null && (
        <div>
          <h3>User Metrics:</h3>
          <p>Total Score: {userMetrics.sum}</p>
          <p>Total Games Played: {userMetrics.count}</p>
          <p>Average Score: {userMetrics.avg}</p>
          <p>Max Game Score: {userMetrics.max}</p>
          <p>Min Game Score: {userMetrics.min}</p>
        </div>
      )}

    {userAcments !== null && (
          <div>
            <h3>User Acheivements:</h3>
            <p>On Games Played:  {userAcments.games_played}</p>
            <p>On Score: {userAcments.score}</p>
          </div>
        )}


      <hr style={{ margin: '20px 0' }} />

      {isComparing ? (
        <div>
          <Select
            options={options.map(option => ({ value: option, label: option }))}
            value={{ value: selectedCompareUserId, label: selectedCompareUserId }}
            onChange={(selectedOption) => {
              setSelectedCompareUserId(selectedOption.value);
            }}
          />
          <Button variant="primary" onClick={handleCompareWithUsers}>
            Compare with User
          </Button>
        </div>
      ) : (
        <Button variant="primary" onClick={handleCompareClick}>
          Compare With
        </Button>
      )}

      {
        compareResult && <MetricsTable metricsData={compareResult} ></MetricsTable>
      }


    </div>
  );
}

//"{\"sum\": {\"metric_value\": [100.0, 90.0], \"metric_winner\": \"test\"}, \"avg\": {\"metric_value\": [100.0, 90.0], \"metric_winner\": \"test\"}, \"max\": {\"metric_value\": [100.0, 90.0], \"metric_winner\": \"test\"}, \"min\": {\"metric_value\": [100.0, 90.0], \"metric_winner\": \"test\"}, \"count\": {\"metric_value\": [1, 1], \"metric_winner\": \"Its a Tie\"}}"
const MetricsTable = ({ metricsData }) => {
  if (!metricsData) {
    return null; // Handle the case where metricsData is not available yet
  }

  const metricsKeys = Object.keys(metricsData);
  const metricKeys = metricsData[metricsKeys[0]].metric_value.map((_, index) => index);

  return (
    <table>
      <thead>
        <tr>
          <th>Metric Category</th>
          {metricKeys.map(key => (
            <th key={key}>Metric  {key}</th>
          ))}
          <th>Metric Winner</th>
        </tr>
      </thead>
      <tbody>
        {metricsKeys.map(metricCategory => (
          <tr key={metricCategory}>
            <td>{metricCategory}</td>
            {metricKeys.map(key => (
              <td key={key}>{metricsData[metricCategory].metric_value[key]}</td>
            ))}
            <td>{metricsData[metricCategory].metric_winner}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};








    





// const TeamStatistics = () => {
//   const [teams, setTeams] = useState([
//     { id: 1, name: 'Team A', members: ['User 1', 'User 2'], isAdmin: true },
//     { id: 2, name: 'Team B', members: ['User 3', 'User 4'], isAdmin: false }
//     // Add more team data as needed
//   ])

//   const get_all_teams_by_userid = async () => {
//     try {
//       const response = await fetch(
//         'https://dqod94jn34.execute-api.us-east-1.amazonaws.com/dev/get_all_teams_by_userid',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ user_id: userDetails.id })
//         }
//       )
//       if (!response.ok) {
//         throw new Error('Network response was not ok')
//       }

//       const jsonData = await response.json() // Parse the response as JSON
//       console.log('get_all_teams_by_userid', jsonData)
//       setTeams(jsonData.body)
//       // setData(jsonData);
//       // setData(response.data); // Update the state with the fetched data
//     } catch (error) {
//       console.error('Error fetching data:', error.message)
//     }
//   }
//   useEffect(() => {
//     // Function to fetch data from the API
//     // Call the fetchData function on component mount
//     get_all_teams_by_userid()
//   }, [])

//   return (
//     <div>
//       <h2 className='mb-5 mt-4'>Team Statistics</h2>

//       <table className='table'>
//         <thead>
//           <tr>
//             <th>Team Name</th>
//             <th>Games Played</th>
//             <th>Top 3</th>
//             <th>Total Scores</th>
//           </tr>
//         </thead>
//         <tbody>
//           {teams?.map(team => (
//             <tr key={team.TeamID}>
//               <td>{team.team_name}</td>
//               <td>{team.team_stats?.total_games_played}</td>
//               <td>{team.team_stats?.top_3}</td>
//               <td>
//                 {team.team_stats?.total_team_points} /{' '}
//                 {team.team_stats?.total_game_points}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }

// const TeamInvitations = () => {
//   const [invitations, setInvitations] = useState([])

//   const getPendingInvitationsList = async () => {
//     try {
//       const response = await fetch(
//         'https://q5u0ez0ip6.execute-api.us-east-1.amazonaws.com/dev/get_pending_invitations_by_userid',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ user_email: userDetails.email })
//         }
//       )
//       if (!response.ok) {
//         throw new Error('Network response was not ok')
//       }

//       const jsonData = await response.json() // Parse the response as JSON
//       console.log('get_all_teams_by_userid', jsonData)
//       setInvitations(jsonData.body)
//       // setData(jsonData);
//       // setData(response.data); // Update the state with the fetched data
//     } catch (error) {
//       console.error('Error fetching data:', error.message)
//     }
//   }
//   useEffect(() => {
//     // Function to fetch data from the API

//     // Call the fetchData function on component mount
//     getPendingInvitationsList()
//   }, [])

//   const handleInvitation = async (status, team_id) => {
//     try {
//       const response = await fetch(
//         'https://lcm36bbx27.execute-api.us-east-1.amazonaws.com/dev/update-invite-status',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             status: status,
//             team_id: team_id,
//             user_id: userDetails.id.toString()
//           })
//         }
//       )
//       if (!response.ok) {
//         throw new Error('Network response was not ok')
//       }

//       const jsonData = await response.json() // Parse the response as JSON
//       console.log('update-invite-status', jsonData)
//       getPendingInvitationsList()
//       // setInvitations(jsonData.body)
//       // setData(jsonData);
//       // setData(response.data); // Update the state with the fetched data
//     } catch (error) {
//       console.error('Error fetching data:', error.message)
//     }

//     // Implement accept invitation logic for the invitation with the given ID
//     // console.log(`Accept invitation with ID: ${invitationId}`)
//   }

//   // const handleDeclineInvitation = invitationId => {
//   //   // Implement decline invitation logic for the invitation with the given ID
//   //   console.log(`Decline invitation with ID: ${invitationId}`)
//   // }
//   // ... (same as the previous code)

//   return (
//     <div>
//       <h2>Pending Team Invitations</h2>
//       <table className='table'>
//         <thead>
//           <tr>
//             <th>Team Name</th>
//             <th>Team Members</th>
//             <th>Team Admins</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {invitations?.map(invitation => (
//             <tr key={invitation.team_id}>
//               <td>{invitation.team_name}</td>
//               <td>
//                 <ul style={{ listStyle: 'none' }}>
//                   {invitation['team_members']?.map(member => (
//                     <li key={member.id}>{member.email}</li>
//                   ))}
//                 </ul>
//               </td>
//               <td>
//                 <ul style={{ listStyle: 'none' }}>
//                   {invitation['team_admins']?.map(member => (
//                     <li key={member.id}>{member.email}</li>
//                   ))}
//                 </ul>
//               </td>
//               <td>
//                 <button
//                   className='btn btn-success me-2'
//                   onClick={() =>
//                     handleInvitation('accepted', invitation.team_id)
//                   }
//                 >
//                   Accept
//                 </button>
//                 <button
//                   className='btn btn-danger'
//                   onClick={() =>
//                     handleInvitation('rejected', invitation.team_id)
//                   }
//                 >
//                   Decline
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }

// const TabDisplay = () => {
//   const [activeTab, setActiveTab] = useState('myTeams')

//   return (
//     <div className='container mt-4'>
//       <ul className='nav nav-tabs'>
//         <li className='nav-item'>
//           <button
//             className={`nav-link ${activeTab === 'myTeams' ? 'active' : ''}`}
//             onClick={() => setActiveTab('myTeams')}
//           >
//             My Teams
//           </button>
//         </li>

//         <li className='nav-item'>
//           <button
//             className={`nav-link ${activeTab === 'statistics' ? 'active' : ''}`}
//             onClick={() => setActiveTab('statistics')}
//           >
//             Teams Statistics
//           </button>
//         </li>

//         <li className='nav-item'>
//           <button
//             className={`nav-link ${
//               activeTab === 'invitations' ? 'active' : ''
//             }`}
//             onClick={() => setActiveTab('invitations')}
//           >
//             Team Invitations
//           </button>
//         </li>
//       </ul>
//       {activeTab === 'myTeams' ? (
//         <UserProfile />
//       ) : activeTab === 'statistics' ? (
//         <TeamStatistics />
//       ) : (
//         <TeamInvitations />
//       )}
//     </div>
//   )
// }

export default UserProfile
