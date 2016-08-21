import { push } from 'react-router-redux'
import api from 'utils/api'

import { GET_SUBJECT, CREATE_SUBJECT } from 'dux/subjects'

import { toggleModal } from 'dux/modal'

export let INVALID_DOCUMENT = `INVALID_DOCUMENT`
export let GET_DOCUMENT = `GET_DOCUMENT`
export let CREATE_DOCUMENT = `CREATE_DOCUMENT`
export let DELETE_DOCUMENT = `DELETE_DOCUMENT`
export let EDIT_DOCUMENT = `EDIT_DOCUMENT`
export let TAG_SENTENCE = `TAG_SENTENCE`
export let CREATE_TAG = `CREATE_TAG`
export let AUTOTAG = `AUTOTAG`
export let DISCARD_SUGGESTION = `DISCARD_SUGGESTION`
export let DISCARD_SUGGESTIONS = `DISCARD_SUGGESTIONS`

export let getDocument = ({ id, subjectId }) =>
  async dispatch => {
    let { document } = await api({ id, endpoint: `getDocument` })

    dispatch({
      type: GET_DOCUMENT,
      payload: { document, id },
    })

    dispatch(push(`/dashboard/subject/${subjectId}/document/${id}`))
  }

export let createDocument = ({ title, author, text, publication, id }) =>
  async dispatch => {

    if (!title || !text) {
      dispatch({
        type: INVALID_DOCUMENT,
        payload: { message: `Title and text fields must contain values!` },
      })
    }

    else {
      let { document_ID: doc_id } = await api({
        title, author, text, publication, id,
        endpoint: `createDocument`,
      })

      dispatch({
        type: CREATE_DOCUMENT,
        payload: {
          document: { name: title, author, text, publication, id: doc_id, tagsCount: 0 },
        },
      })
    }
  }

export let editDocument = document => ({ type: EDIT_DOCUMENT, payload: document })

export let deleteDocument = ({ docId, subjId }) =>
  async dispatch => {
    await api({
      docId, subjId,
      endpoint: `deleteDocument`,
    })

    dispatch({
      type: DELETE_DOCUMENT,
      payload: { docId },
    })
  }

export let tagSentence = ({ sentence }) => ({
  type: TAG_SENTENCE,
  payload: { sentence },
})

export let createTag = ({ id, value }) =>
  async dispatch => {
    let { tag_id } = await api({
      id, value,
      endpoint: `createTag`,
    })

    dispatch({
      type: CREATE_TAG,
      payload: { tag_id },
    })

    /*
     *  TODO: get this information from the server
     */

    dispatch(getDocument({
      id: location.pathname.split(`/`).pop(),
      subjectId: location.pathname.split(`/`)[location.pathname.split(`/`).length - 3],
    }))
  }

export let autoTag = ({ id }) =>
  async dispatch => {
    let { suggestedTags, message } = await api({ id, endpoint: `autoTag` })

    if (!message && suggestedTags.length) {
      dispatch({
        type: AUTOTAG,
        payload: { suggestedTags },
      })
    }

    else dispatch(toggleModal(`NoSuggestions`))
  }

export let discardSuggestion = ({ suggestion }) =>
  ({ type: DISCARD_SUGGESTION, payload: suggestion })

export let discardSuggestions = () => ({ type: DISCARD_SUGGESTIONS })

/*----------------------------------------------------------------------------*/

let intialState = {
  documents: [],
  document: {
    sentences: [],
  },
  sentenceBeingTagged: {},
  suggestedTags: [],
  documentBeingEdited: {},
}

export default (state = intialState, action) => {

  switch (action.type) {

    case CREATE_DOCUMENT:
      return {
        ...state,
        documents: [
          ...state.documents,
          action.payload.document,
        ],
      }

    case GET_DOCUMENT:
      return {
        ...state,
        document: action.payload.document,
      }

    case GET_SUBJECT:
      return {
        ...state,
        documents: action.payload.documents,
      }

    case CREATE_SUBJECT:
      return {
        ...state,
        documents: intialState.documents,
      }

    case TAG_SENTENCE:
      return {
        ...state,
        sentenceBeingTagged: action.payload.sentence,
      }

    case AUTOTAG:
      return {
        ...state,
        suggestedTags: action.payload.suggestedTags,
      }

    case DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter(x => x.id !== action.payload.docId),
      }

    case EDIT_DOCUMENT:
      return {
        ...state,
        documentBeingEdited: action.payload.document,
      }

    case DISCARD_SUGGESTION:
      return {
        ...state,
        suggestedTags: state.suggestedTags.filter(x => x.sentence_id !== action.payload.sentence_id),
      }

    case DISCARD_SUGGESTIONS:
      return {
        ...state,
        suggestedTags: [],
      }

    default:
      return state
  }

}
