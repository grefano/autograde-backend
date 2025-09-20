const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
const {getClass, addSubmissionToClass} = require('../classrooms')

const authClassroom = async (req, res, next) => {
    const {authorization} = req.headers
    if (!authorization){
        return res.status(500).json({error: 'token da classroom não foi especificado'}) 
    }
    const token = (authorization.split(' ')[1])
    console.log(`authclassroom ${token} `)
    
    try {
        let classroom = getClass(token)
        console.log(classroom)        
        if (classroom){
            req.password = token
            next()
        }
    } catch (error){
        return res.status(500).json({error: `token ${token} é inválido`})
    }
}

const authClassroomTeacher = async (req, res, next) => {
    const {authorization} = req.headers
    if (!authorization){
        return res.status(500).json({error: 'token do dono da sala não foi especificado'})
    }
    let auths = authorization.split(' ')
    let password = auths[1]
    let tokenteacher = auths[2] 
    console.log(`password ${password} tokenteacher ${tokenteacher}`)


    if (!getClass(password)){
        return res.status(500).json({error: 'sala não existe'})
    }



    try {
        
        verify = getClass(password).tokenteacher == tokenteacher
        console.log('verify', verify)
        if (verify){
            req.password = password
            next()
        }
    } catch(error){
        res.status(500).json({error: 'usuário não é o dono da sala'})
    }
}

module.exports = {
    authClassroom, authClassroomTeacher
}