import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
// import Form from 'react-bootstrap/Form'
import { Form } from 'react-bootstrap'
import { Configuration, OpenAIApi } from 'openai'
import Select from 'react-select'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Header from '../../Components/Header/Header'
import { useNavigate } from 'react-router'

const userDetails = JSON.parse(localStorage.getItem('userDetails'))

const MyTeams = () => {
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [options, setOptions] = useState([])
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false)
  // const [PromoteToAdminMember, setPromoteToAdminMember] = useState(null)
  const [showPromoteToAdminModal, setShowPromoteToAdminModal] = useState(false)
  const [generatedName, setGeneratedName] = useState('')
  // const [selectedMember, setSelectedMember] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  // const [newMember, setNewMember] = useState(null)
  const [selectedTeamForModal, setSelectedTeamForModal] = useState(null)
  const [filteredMembersOfTeam, setFilteredMembersOfTeam] = useState([])
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [memberToPromote, setMemberToPromote] = useState(null)
  const navigate = useNavigate()
  // const [MembersSelected, setMembersSelected] = useState(false)

  const get_all_teams_by_userid = async () => {
    try {
      const response = await fetch(
        'https://dqod94jn34.execute-api.us-east-1.amazonaws.com/dev/get_all_teams_by_userid',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: userDetails.id })
        }
      )
      const jsonData = await response.json() // Parse the response as JSON
      setTeams(jsonData.body)
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
      const jsonData = await response.json() // Parse the response as JSON
      console.log('users:', JSON.parse(jsonData.body))
      const users = JSON.parse(jsonData.body)
      setUsers(users)
      setOptions(
        users.map(obj => ({
          value: obj,
          label: obj.email
        }))
      )
      console.log('hhhhhhhhhhhhh', users)
      // setTeams(response.body)
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }

  useEffect(() => {
    if(localStorage.getItem('userDetails') != null){

      get_all_teams_by_userid()
      getUsersList()
    } else {
      alert('Please login first.')
      navigate('/')
    }
  }, [])

  const getFilteredTeamMembers = team => {
    const filteredTeamMembers = team.team_members.filter(
      member => !team.team_admins.some(admin => admin.email === member.email)
    )
    setFilteredMembersOfTeam(filteredTeamMembers)
  }

  const handleLeaveTeam = async team => {
    console.log('team in leave team', team);
    try {
      const response = await fetch(
        'https://orxuejrsl2.execute-api.us-east-1.amazonaws.com/dev/leave_team',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            MemberID: userDetails.id,
            TeamID: team.TeamID,
            MemberEmail: userDetails.email
          })
        }
      )
      const jsonData = await response.json()
      console.log('get_all_teams_by_userid', jsonData)
      alert('You left the team successfully')
      get_all_teams_by_userid()
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }

  const generateTeamName = async () => {
    const configuration = new Configuration({
      //   apiKey: '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',
      apiKey: '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',
      organization: 'org-v0xdX0Os4mPcTvxF5KRlt2sV'
    })

    const openai = new OpenAIApi(configuration)

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'generate a weird unique team name when asked' }]
      })

      const teamName = response.data.choices[0].message.content
      console.log('name: ', response.data.choices[0].message.content)
      setGeneratedName(teamName)
    } catch (error) {
      console.error('Failed to generate a team name:', error)
    }
  }

  const handleAddMember = newMembers => {
    const members = newMembers.map(obj => obj.value)
    console.log('updated members: ', members)
    setTeamMembers(members)
    // setTimeout(() => {
    //   console.log('hhhh', teamMembers)
    // }, 5000)
    // setNewMember('')
  }

  const handleCreateTeam = async () => {
    try {
      let team_members = teamMembers.map(member => ({
        id: member.user_id,
        email: member.email,
        invitation_status: 'pending'
      }))
      team_members.push({
        id: userDetails.id,
        email: userDetails.email,
        invitation_status: 'accepted'
      })
      const team_admins = [
        {
          id: userDetails.id,
          email: userDetails.email
        }
      ]
      const payload = {
        team_members: team_members,
        team_admins: team_admins,
        team_name: generatedName
      }
      const response = await fetch(
        'https://q4zr8nw9ze.execute-api.us-east-1.amazonaws.com/dev/add_new_team',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )
      const jsonData = await response.json() // Parse the response as JSON
      console.log(jsonData.body)
      closeCreateTeamModal()
      get_all_teams_by_userid()
      alert(
        'Team created successfully! Your team members would have received the invitation email'
      )
      // setTeams(jsonData.body)
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }

  // const handleChange = e => {
  //   console.log('new member selected', e)
  //   // setNewMember(e.target.value)
  // }

  // const filteredOptions = users?.filter(option =>
  //   option.email.toLowerCase().includes(newMember.email.toLowerCase())
  // )

  // const handleRemoveMemberForCreateTeam = index => {
  //   const updatedData = [...teamMembers]
  //   updatedData.splice(index, 1)
  //   setTeamMembers(updatedData)
  // }

  const openCreateTeamModal = () => {
    generateTeamName()
    getUsersList()
    setShowCreateTeamModal(true)
  }

  const closeCreateTeamModal = () => {
    setGeneratedName('')
    setTeamMembers([])
    // setSelectedMember(null)
    setShowCreateTeamModal(false)
  }

  const openPromoteToAdminModal = team => {
    setSelectedTeamForModal(team)
    getFilteredTeamMembers(team)
    setShowPromoteToAdminModal(true)
  }

  const closePromoteToAdminModal = () => {
    setSelectedTeamForModal(null)
    setMemberToPromote(null)
    setShowPromoteToAdminModal(false)
  }

  const handlePromoteToAdminModal = async () => {
    try {
      const response = await fetch(
        'https://eke3a9r1pl.execute-api.us-east-1.amazonaws.com/dev/promote_member_to_admin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            TeamID: selectedTeamForModal.TeamID,
            MemberID: memberToPromote.id,
            AdminID: userDetails.id,
            MemberEmail: memberToPromote.email
          })
        }
      )
      const jsonData = await response.json() // Parse the response as JSON
      closePromoteToAdminModal()
      get_all_teams_by_userid()
      alert('Team member promoted to admin successfully')
      // setTeams(jsonData.body)
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }

  const openRemoveMemberModal = team => {
    console.log('team seleected for remove', team)
    setSelectedTeamForModal(team)
    setShowRemoveMemberModal(true)
  }

  const closeRemoveMemberModal = () => {
    setSelectedTeamForModal(null)
    setMemberToRemove(null)
    setShowRemoveMemberModal(false)
  }

  const handleRemoveMemberModal = async () => {
    console.log('team id', selectedTeamForModal)
    console.log('MemberID', memberToRemove)
    console.log('AdminID', userDetails.id)
    console.log('MemberEmail', memberToRemove.email)
    try {
      const response = await fetch(
        'https://hj9hfhcnh6.execute-api.us-east-1.amazonaws.com/dev/remove_team_member',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            TeamID: selectedTeamForModal.TeamID,
            MemberID: memberToRemove.id,
            AdminID: userDetails.id,
            MemberEmail: memberToRemove.email
          })
        }
      )
      const jsonData = await response.json() // Parse the response as JSON
      closeRemoveMemberModal()
      get_all_teams_by_userid()
      alert('Team member removed successfully')
      // setTeams(jsonData.body)
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }

  const isAdmin = team => {
    return team.team_admins.some(admin => admin.id === userDetails.id)
  }

  const handleMemberToRemove = e => {
    console.log(selectedTeamForModal.team_members[e.target.value])
    setMemberToRemove(selectedTeamForModal.team_members[e.target.value])
  }
  const handleMembertoPromote = e => {
    // console.log(selectedTeamForModal.team_members[e.target.value])
    const member = selectedTeamForModal.team_members.find(
      admin => admin.id === e.target.value
    )
    setMemberToPromote(member)
  }

  return (
    <div>
      {/* CREATE TEAM MODAL */}
      <Modal show={showCreateTeamModal} centered onHide={closeCreateTeamModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h5>Team Name: {generatedName}</h5>
            <div className='form-group'>
              <label htmlFor='newMember'>Add Member (upto 4 members):</label>
              <div className='input-group d-flex'>
                {/* <input
                  type='text'
                  className='form-control'
                  id='newMember'
                  value={newMember}
                  onChange={e => setNewMember(e.target.value)}
                /> */}
                <div className='' style={{ width: '100%' }}>
                  <Select
                    options={options}
                    isMulti
                    onChange={handleAddMember}
                    isOptionDisabled={() => teamMembers.length >= 4}
                  ></Select>
                </div>
                {/* ); */}
                {/* <div className='input-group-append'>
                  <button
                    className='btn btn-primary'
                    type='button'
                    onClick={handleAddMember}
                  >
                    Add
                  </button>
                </div> */}
              </div>
            </div>
            {/* {teamMembers.length > 0 && (
              <div className='mb-3'>
                <strong>Members:</strong>
                <ul className='list-group'>
                  {teamMembers.map((member, index) => (
                    <li
                      key={index}
                      className='list-group-item d-flex justify-content-between align-items-center'
                    >
                      {member}
                      <button
                        className='btn btn-danger btn-sm'
                        type='button'
                        onClick={() => handleRemoveMemberForCreateTeam(index)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={closeCreateTeamModal}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleCreateTeam}>
            Create team
          </Button>
        </Modal.Footer>
      </Modal>

      {/* REMOVE MEMBER MODAL */}
      <Modal
        show={showRemoveMemberModal}
        centered
        onHide={closeRemoveMemberModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Remove Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h5>Team Name: {selectedTeamForModal?.team_name}</h5>
            <select
              className='form-control'
              id='memberToRemove'
              // value={JSON.stringify(memberToRemove)}
              onChange={handleMemberToRemove}
            >
              <option value=''>Select a member to remove</option>
              {selectedTeamForModal?.team_members?.map((member, index) => {
                if (member.id !== userDetails.id) {
                  return (
                    <option key={index} value={index}>
                      {member.email}
                    </option>
                  )
                } else return null
              })}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={closeCreateTeamModal}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleRemoveMemberModal}>
            Remove Selected Member
          </Button>
        </Modal.Footer>
      </Modal>

      {/* PROMOTE TO ADMIN MODAL */}
      <Modal
        show={showPromoteToAdminModal}
        centered
        onHide={closePromoteToAdminModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Promote Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h5>Team Name: {selectedTeamForModal?.team_name}</h5>
            <select
              className='form-control'
              id='memberToRemove'
              // value={memberToPromote}
              onChange={handleMembertoPromote}
            >
              <option value=''>Select a member to remove</option>
              {filteredMembersOfTeam.map((member, index) => (
                <option key={index} value={member.id}>
                  {member.email}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={closeCreateTeamModal}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handlePromoteToAdminModal}>
            Promote member to Admin
          </Button>
        </Modal.Footer>
      </Modal>
      <div className='d-flex justify-content-between m-4'>
        <h2 className='mb-3 mt-2'>My Teams</h2>
        <button className='btn btn-primary me-4' onClick={openCreateTeamModal}>
          Create Team
        </button>
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Members</th>
            <th>Admins</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {teams?.map(team => (
            <tr key={team.TeamID}>
              <td>{team.team_name}</td>
              <td>
                <ul style={{ listStyle: 'none' }}>
                  {team['team_members']?.map(member => (
                    <li key={member.id}>
                      {member.email} ({member.invitation_status})
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <ul style={{ listStyle: 'none' }}>
                  {team['team_admins']?.map(member => (
                    <li key={member.id}>{member.email}</li>
                  ))}
                </ul>
              </td>
              <td>
                <button
                  className='btn btn-danger me-1'
                  onClick={() => handleLeaveTeam(team)}
                >
                  Leave Team
                </button>
                {isAdmin(team) && (
                  <>
                    <button
                      className='btn btn-warning me-2'
                      onClick={() => openRemoveMemberModal(team)}
                    >
                      Remove Member
                    </button>
                    <button
                      className='btn btn-primary'
                      onClick={() => openPromoteToAdminModal(team)}
                    >
                      Promote To Admin
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TeamStatistics = () => {
  const [teams, setTeams] = useState([
    { id: 1, name: 'Team A', members: ['User 1', 'User 2'], isAdmin: true },
    { id: 2, name: 'Team B', members: ['User 3', 'User 4'], isAdmin: false }
    // Add more team data as needed
  ])

  const get_all_teams_by_userid = async () => {
    try {
      const response = await fetch(
        'https://dqod94jn34.execute-api.us-east-1.amazonaws.com/dev/get_all_teams_by_userid',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: userDetails.id })
        }
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const jsonData = await response.json() // Parse the response as JSON
      console.log('get_all_teams_by_userid', jsonData)
      setTeams(jsonData.body)
      // setData(jsonData);
      // setData(response.data); // Update the state with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }
  useEffect(() => {
    // Function to fetch data from the API
    // Call the fetchData function on component mount
    get_all_teams_by_userid()
  }, [])

  return (
    <div>
      <h2 className='mb-5 mt-4'>Team Statistics</h2>

      <table className='table'>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Games Played</th>
            <th>Top 3</th>
            <th>Total Scores</th>
          </tr>
        </thead>
        <tbody>
          {teams?.map(team => (
            <tr key={team.TeamID}>
              <td>{team.team_name}</td>
              <td>{team.team_stats?.total_games_played}</td>
              <td>{team.team_stats?.top_3}</td>
              <td>
                {team.team_stats?.total_team_points} /{' '}
                {team.team_stats?.total_game_points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TeamInvitations = () => {
  const [invitations, setInvitations] = useState([])

  const getPendingInvitationsList = async () => {
    try {
      const response = await fetch(
        'https://q5u0ez0ip6.execute-api.us-east-1.amazonaws.com/dev/get_pending_invitations_by_userid',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_email: userDetails.email })
        }
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const jsonData = await response.json() // Parse the response as JSON
      console.log('get_all_teams_by_userid', jsonData)
      setInvitations(jsonData.body)
      // setData(jsonData);
      // setData(response.data); // Update the state with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }
  }
  useEffect(() => {
    // Function to fetch data from the API

    // Call the fetchData function on component mount
    getPendingInvitationsList()
  }, [])

  const handleInvitation = async (status, team_id) => {
    try {
      const response = await fetch(
        'https://lcm36bbx27.execute-api.us-east-1.amazonaws.com/dev/update-invite-status',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: status,
            team_id: team_id,
            user_id: userDetails.id.toString()
          })
        }
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const jsonData = await response.json() // Parse the response as JSON
      console.log('update-invite-status', jsonData)
      getPendingInvitationsList()
      alert('Invitation status updated successfully')
      // setInvitations(jsonData.body)
      // setData(jsonData);
      // setData(response.data); // Update the state with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error.message)
    }

    // Implement accept invitation logic for the invitation with the given ID
    // console.log(`Accept invitation with ID: ${invitationId}`)
  }

  // const handleDeclineInvitation = invitationId => {
  //   // Implement decline invitation logic for the invitation with the given ID
  //   console.log(`Decline invitation with ID: ${invitationId}`)
  // }
  // ... (same as the previous code)

  return (
    <div>
      <h2 className='my-4'>Pending Team Invitations</h2>
      <table className='table'>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Team Members</th>
            <th>Team Admins</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invitations?.map(invitation => (
            <tr key={invitation.team_id}>
              <td>{invitation.team_name}</td>
              <td>
                <ul style={{ listStyle: 'none' }}>
                  {invitation['team_members']?.map(member => (
                    <li key={member.id}>{member.email}</li>
                  ))}
                </ul>
              </td>
              <td>
                <ul style={{ listStyle: 'none' }}>
                  {invitation['team_admins']?.map(member => (
                    <li key={member.id}>{member.email}</li>
                  ))}
                </ul>
              </td>
              <td>
                <button
                  className='btn btn-success me-2'
                  onClick={() =>
                    handleInvitation('accepted', invitation.team_id)
                  }
                >
                  Accept
                </button>
                <button
                  className='btn btn-danger'
                  onClick={() =>
                    handleInvitation('rejected', invitation.team_id)
                  }
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TabDisplay = () => {
  const [activeTab, setActiveTab] = useState('myTeams')

  return (
    <>
      <Header />
      <div className='container mt-4'>
        <ul className='nav nav-tabs'>
          <li className='nav-item'>
            <button
              className={`nav-link ${activeTab === 'myTeams' ? 'active' : ''}`}
              onClick={() => setActiveTab('myTeams')}
            >
              My Teams
            </button>
          </li>

          <li className='nav-item'>
            <button
              className={`nav-link ${
                activeTab === 'statistics' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('statistics')}
            >
              Teams Statistics
            </button>
          </li>

          <li className='nav-item'>
            <button
              className={`nav-link ${
                activeTab === 'invitations' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('invitations')}
            >
              Team Invitations
            </button>
          </li>
        </ul>
        {activeTab === 'myTeams' ? (
          <MyTeams />
        ) : activeTab === 'statistics' ? (
          <TeamStatistics />
        ) : (
          <TeamInvitations />
        )}
      </div>
    </>
  )
}

export default TabDisplay
