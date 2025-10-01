const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const {getClass, addSubmissionToClass} = require('../classrooms')

const authClassroom = async (req, res, next) => {
    const {authorization} = req.headers
    if (!authorization){
        return res.status(500).json({error: 'token da classroom não foi especificado'}) 
    }
    // console.log('authorization headers', authorization)
    let token = (authorization.split(' ')[1])
    // console.log(`authclassroom ${token} `)
    let tokenverify = jwt.verify(token, JWT_SECRET)
    let password = tokenverify['password']
    let name = tokenverify['name']
    let classroom = getClass(password)
    // console.log(`verify ${JSON.stringify(tokenverify)} password ${password} classroom ${classroom}`)

    if (!classroom){
        return res.status(500).json({error: 'sala não existe'})
    }
    // console.log(`members ${classroom.members_tokens} includes ${token}`)
    if (classroom.members_tokens.includes(token) || classroom.tokenteacher == token){
        // aluno está na sala
        req.password = password
        req.token = token
        req.name = name
        next() 
    } else {
        return res.status(500).json({error: 'usuário não está na sala'})
    }

}

const authClassroomTeacher = async (req, res, next) => {
    const {authorization} = req.headers
    if (!authorization){
        return res.status(500).json({error: 'token do dono da sala não foi especificado'})
    }
    let token = authorization.split(' ')[1]
    let tokenverify = jwt.verify(token, JWT_SECRET)
    let password = tokenverify['password']
    let classroom = getClass(password)
    // console.log(`password ${password} classroom ${classroom}`)
    if (!classroom){
        return res.status(500).json({error: 'sala não existe'})
    }
    if (classroom.tokenteacher == token){
        // é o dono da sala mesmo
        req.password = password
        req.token = token
        next()
    } else {
        return res.status(500).json({error: 'usuário não é o dono da sala'})
    }        



}

module.exports = {
    authClassroom, authClassroomTeacher
}