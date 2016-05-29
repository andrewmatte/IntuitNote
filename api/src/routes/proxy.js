import fetch from 'isomorphic-fetch'
import brain from '../../config/domain'
import User from '../models/User'

export default ({ api }) =>
  api.post(`/proxy`, (req, res) => {
    let { userEmail, name, endpoint } = req.body

    User.findOne({ email: req.docoded.email }, (err, user) => {

      if (user) {

        fetch(`${brain}/${endpoint}`, {
          method: `POST`,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
          .then(res => {
            if (res.status >= 400)
              throw new Error(`Bad response from server`)

            return res.json()
          })
          .then(({ id }) => {

              if (err) throw err

              user.subjects = [ ...user.subjects, { name, id, numDocuments: 0 } ]

              user.save((err, user) => {
                if (err) throw err
                res.json({ id })
              })
          })
          .catch(error => res.json({ error: error.message }))

      }
    })
  })