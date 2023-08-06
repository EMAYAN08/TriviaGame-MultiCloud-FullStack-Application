import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import './Header.css'
import { useNavigate } from 'react-router-dom'

//reference - https://react-bootstrap.netlify.app/docs/components/navbar/#responsive-behaviors
function Header () {
  const navigate = useNavigate()

  const handleLogout = e => {
    e.preventDefault()
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('userDetails')
    navigate('/')
  }
  return (
    <>
      <nav class='navbar navbar-dark bg-primary'>
        <a class='navbar-brand mx-5' href='/trivialobby'>
          Trivia Titans
        </a>

        <div className='header-nav d-flex mx-5 nav-item justify-content-between'>
          <a class='nav-link  align-self-center me-4' href='/trivialobby'>
            <strong>Game Lobby</strong>
          </a>
          <a class='nav-link align-self-center me-4' href='/leaderboard'>
            <strong>Leaderboard</strong>
          </a>
          <a class='nav-link  align-self-center me-4' href='/my-teams'>
            <strong>My Teams</strong>
          </a>
          <a class='nav-link align-self-center me-4' href='/user'>
            <strong>My Profile</strong>
          </a>
          <button
            class='btn btn-outline-light ms-4 my-2 my-sm-0'
            onClick={handleLogout}
          >
            <strong>Logout</strong>
          </button>
        </div>
      </nav>
    </>
  )
}

export default Header
