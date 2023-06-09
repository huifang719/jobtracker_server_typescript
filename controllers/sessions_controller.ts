import express from 'express';
import { SessionData } from 'express-session';
import bcrypt from 'bcrypt';
import User from '../models/User';
import UserDto from '../dto/UserDto';

const router = express.Router()

interface CustomSessionData extends SessionData {
  userId?: number;
}

router.get('/', (req, res) => {
  const customSessionData: CustomSessionData = req.session as CustomSessionData;
    if (customSessionData.userId) {
        User 
            .findById(customSessionData.userId)
            .then(email => res.json(email))
    } else {
        res.json({error: 'no logged in user'})
    }
})


router.post('/', (req, res) => {
    const {email, password} = req.body as UserDto;

    User
        .findByEmail(email)
        .then(user => {
          const isValidPassword = bcrypt.compareSync(password, user.password_digest)
            if (user && isValidPassword) {
              const customSessionData: CustomSessionData = req.session as CustomSessionData;
                customSessionData.userId = user.id;
                res.json(email)
            } else {
                res.status(400).send({error: "Incorrect email or/and password"}) 
            }   
        })
})

router.delete('/', (req, res) => {
  const customSessionData: CustomSessionData = req.session as CustomSessionData;
    if (!customSessionData.userId) {
      return res.status(400).send({error: "No user logged in"}) 
    } 

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({ error: 'Error destroying session' });
    }
    return res.clearCookie('session'); // optional: clears the session cookie from the client
  })
})

export default router;