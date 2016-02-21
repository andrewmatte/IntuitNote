import React, { Component, Children, cloneElement, PropTypes } from 'react'

/*----------------------------------------------------------------------------*/

import { domain } from 'config'
import auth from '../auth'
import isAValidEmail from 'utils/isEmail'

/*----------------------------------------------------------------------------*/

import Modals from 'components/Modals'
import Dialog from 'material-ui/lib/dialog'

/*----------------------------------------------------------------------------*/

import io from 'socket.io-client'
let socket = io(`${domain}:8080`)

export default class App extends Component {
  static contextTypes = { router: PropTypes.object };

  constructor (props) {
    super(props)
    this.state = {

      /*
       *  User State
       */

      loggedIn: auth.loggedIn(),
      user: { email: localStorage.userEmail },
      subjects: [],

      /*
       *  UI State
       */

      ModalComponent: Modals[`auth`],
      modalOpen: false,
      editingSubject: false,
    }
  }

  /*
   *  UI State Logic
   */

   openModal = modal =>
     this.setState({ modalOpen: true, ModalComponent: Modals[modal] });

   closeModal = () =>
     this.setState({ modalOpen: false, message: `` });

  /*
   *  Auth Logic
   */

  login = (type, { email, password }) => {
    if (!isAValidEmail(email))
      return this.setState({ message: `Invalid email` })

    auth[type]({ email, password }, response => {
      if (response.success) {

        // TODO: load subjects

        this.setState({
          loggedIn: response.success,
          user: response.user,
          modalOpen: false,
          message: ``,
        })

        this.context.router.replace(`/dashboard`)
      }

      else this.setState({ message: response.message })
    })
  };

  logout = () => {
    localStorage.clear()
    this.context.router.replace(`/`)
    this.setState({ loggedIn: false, headerColor: `rgb(27, 173, 112)` })
  };

  /*
   *  User Logic
   */

  createSubject = async ({ title }) => {
    if (!title) return this.setState({ message: `Please name your subject!` })

    let response = await fetch(`${domain}:8080/api/newSubject`, {
      method: `POST`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: localStorage.token,
        userEmail: localStorage.userEmail,
        title,
      }),
    })

    let data = await response.json()

    this.setState({
      subjects: [
        ...this.state.subjects.map(s => ({ ...s, active: false })),
        {
          title,
          active: true,
          createdDate: +new Date(),
          updatedDate: +new Date(),
          docs: [],
        },
      ],
      message: ``,
      modalOpen: false,
    })
  };

  setSubject = ({ title }) => {
    /*
     *  TODO: fetch subject from server
     */

    this.setState({
      subjects:
        this.state.subjects.map(s => ({ ...s, active: s.title === title })),
    })
  };

  deleteSubject = ({ title }) => {
    /*
     *  TODO: call delete endpoint
     */

    this.setState({
      subjects: this.state.subjects.filter(s => s.title !== title ),
      modalOpen: false,
    })
  };

  toggleSubjectEditing = () =>
    this.setState({ editingSubject: !this.state.editingSubject });

  handleDrop = event => {
    console.log(event)
  }

  addDocument = async ({ title, author, text, subjectId }) => {
    let response = await fetch(`${domain}:8080/api/newDocument`, {
      method: `POST`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: localStorage.token,
        userEmail: localStorage.userEmail,
        title, author, text, subjectId,
      }),
    })

    let data = await response.json()

    this.setState({
      message: ``,
      modalOpen: false,
    })
  }

  render() {
    let { ModalComponent, subjects } = this.state

    let children = Children.map(this.props.children, child => {
      return cloneElement(child, {
        ...child.props,
        ...this.props,
        ...this.state,
        login: this.login,
        logout: this.logout,
        openModal: this.openModal,
        closeModal: this.closeModal,
        setSubject: this.setSubject,
        deleteSubject: this.deleteSubject,
        toggleSubjectEditing: this.toggleSubjectEditing,
        socket,
      })
    })

    return (
      <div id="app">
        <Dialog
          className="auth-modal"
          open={ this.state.modalOpen }
          onRequestClose={ this.handleClose }
        >
          <ModalComponent
            closeModal={ this.closeModal }
            login={ this.login }
            message={ this.state.message }

            // conditionally add these
            createSubject={ this.createSubject }
            deleteSubject={ this.deleteSubject }
            subjects={ subjects }
            handleDrop={ this.handleDrop }
          />
        </Dialog>

        { children }
      </div>
    )
  }
}
