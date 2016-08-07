import React from 'react'
import { connect } from 'react-redux'
import { toggleModal } from 'dux/modal'
import { deleteDocument } from 'dux/documents'

let ConfirmDocument = ({
  message,
  subject,
  documentBeingEdited,
  dispatch,
}) =>
  <div className="confirm modal-content">
    <div className="modal-title">DELETE DOCUMENT?</div>
    <div className="new-subject form">
      <div className="button-row">
        <button className="delete" onClick={ () =>
          dispatch(deleteDocument({
            subjId: subject.id,
            docId: documentBeingEdited.id,
          }))
        }>
          YES, DELETE
        </button>
        <button onClick={ () => dispatch(toggleModal()) }>NO, CANCEL</button>
      </div>
      <div className="error">{ message }</div>
    </div>
  </div>

export default connect(
  state => ({
    ...state.message,
    ...state.subjects,
    ...state.documents,
  })
)(ConfirmDocument)
