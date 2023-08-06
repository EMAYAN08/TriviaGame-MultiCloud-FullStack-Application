import React, { useState } from 'react'
import { Configuration, OpenAIApi } from 'openai'

const TeamNameGenerator = () => {
  const [generatedName, setGeneratedName] = useState('')
  const [email, setEmail] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])

  const handleEmailChange = e => {
    setEmail(e.target.value)
  }

  const handleAddTeamMember = () => {
    if (email.trim() !== '') {
      setTeamMembers([...teamMembers, email])
      setEmail('')
    }
  }

  const createTeam = () => {}

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
        messages: [{ role: 'user', content: 'generate a team name' }]
      })

      const teamName = response.data.choices[0].message.content
      console.log('name: ', response.data.choices[0].message.content)
      setGeneratedName(teamName)
    } catch (error) {
      console.error('Failed to generate a team name:', error)
    }
  }

  return (
    <div>
      <h1>Team Name Generator</h1>
      {generatedName ? (
        <div>
          <p>Suggested Team Name:</p>
          <h2>{generatedName}</h2>
        </div>
      ) : (
        <button onClick={generateTeamName}>Generate Team Name</button>
      )}
      <div>
        <h2>Add Team Members</h2>
        <div>
          <input
            type='email'
            value={email}
            onChange={handleEmailChange}
            placeholder='Enter email'
          />
          <button onClick={handleAddTeamMember}>Add</button>
        </div>
        <ul>
          {teamMembers.map((member, index) => (
            <li key={index}>{member}</li>
          ))}
        </ul>
        <button onClick={createTeam}>Create Team</button>
      </div>
    </div>
  )
}

export default TeamNameGenerator
