require('dotenv').config()
const express = require('express');
const cors = require('cors');
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() }) 
const jwt = require('jsonwebtoken')
// const bcrypt = require('bcrypt')
// const crypto = require('crypto')

const {run_code} = require('./util/run_code')
const {authClassroom, authClassroomTeacher} = require('./middlewares/auth')
const {getClass, getClasses, deleteClass, addSubmissionToClass, createClass, openClass, addMemberToClass, removeMemberFromClass, addResponseToClass, getResponses} = require('./classrooms')

const app = express();
const PORT = 3000;


app.use(cors({
    origin: '*'
}));
app.use(express.json())


const JWT_SECRET = process.env.JWT_SECRET




app.post('/api/class/create/:password', async (req, res) => {
    const {password} = req.params
    console.log('create', password)
    let token = jwt.sign({password: password}, JWT_SECRET)
    createClass(password, token)
    res.status(200).json({token})
})  

app.post('/api/class/join/:password/:name', async (req, res) => {
    const {password, name} = req.params
    let token = jwt.sign({password, name}, JWT_SECRET)
    let entrou = addMemberToClass(password, token)
    if (entrou){
        res.status(200).json({token: token})
    } else {
        res.status(404).json({msg: 'sala não existe'})
    }
})



app.get('/api/class', authClassroom, async (req, res) => {
    let classroom = getClass(req.password)
    let count_names = {}
    let members = {}
    classroom.members_tokens.forEach(membertoken => {
        let verify = jwt.verify(membertoken, JWT_SECRET)
        let name = verify.name
        console.log(`verify ${JSON.stringify(verify)}`)
        if (count_names[name]){
            count_names[name]++
        } else {
            count_names[name] = 1
        }
        members[membertoken] = count_names[name] > 1 ? `${name} ${count_names[name]}` : name  
    });
    let submissions = classroom.submissions.map(submission => {
        return {...submission, owner_token: submission.owner, owner_name: members[submission.owner]}
    })
    console.log(members)
    res.status(200).json({submissions, members})
})


app.post('/api/code/return', authClassroomTeacher, async (req, res) => {
    const {code, membertoken} = req.body
    try {
        addResponseToClass(code, req.password, req.token, membertoken)
    } catch (error){
        console.log('error adding response', error)
        return res.status(500).json({success: false, error})
    }

    res.status(200).json({success: true})
})

app.get('/api/code/return', authClassroom, async (req, res) => {
    let responses = getResponses(req.password, req.token)
    console.log('responses', responses)
    res.status(200).json(responses)
})

app.post('/api/code/:lang', authClassroom, upload.single('file'), async (req, res) => {

    if (!getClass(req.password).open){
        return res.status(500).json({msg: 'sala está fechada'})
    }

    const code = req.file.buffer.toString('utf-8')
    const {lang} = req.params
    console.log(lang)

    result = await run_code(code, lang)

    addSubmissionToClass(req.password, {lang, code, owner: req.token})

    // submissions.push({...result, code})
    console.log(result)
    res.json(result)


})

app.patch('/api/class/close', authClassroomTeacher, (req, res) => {
    console.log('finalizar envios', req.password)
    openClass(req.password, false)
    res.status(200).json(getClass(req.password).submissions)
})

// app.patch('/api/class/keep-alive', authClassroomTeacher, (req, res) => {

//     res.status(200).json({success: true})
// })

app.post('/api/class/exit', authClassroom, (req, res) => {
    removeMemberFromClass(req.password, req.token)
    res.status(200).json({msg: 'saiu'})
})

app.delete('/api/class', authClassroomTeacher, (req, res) => {
    deleteClass(req.password)
    res.status(200).json({msg: 'deletou'})
})

app.get('/api/update', authClassroom, (req, res) => {
    res.status(200).getClass(req.password).submissions
})


app.get('/debug/classrooms', (req, res) => {
    res.status(200).json(Object.fromEntries(getClasses()))
})

app.get('/keep-alive', (req, res) => {
    res.status(200).json({msg: 'ta vivo'})
})

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

