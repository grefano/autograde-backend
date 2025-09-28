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
const {getClass, getClasses, deleteClass, addSubmissionToClass, createClass, openClass, addMemberToClass, removeMemberFromClass} = require('./classrooms')

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
    // let token = jwt.sign({password: password}, JWT_SECRET)
    // let token = await bcrypt.hash(password, 12)
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    // let token = ''
    // for(let i = 0; i < 16; i++){
    //     token += characters.charAt(Math.random() * characters.length)
    // }
    let token = jwt.sign({password: password}, JWT_SECRET)
    createClass(password, token)
    res.status(200).json({token})
})  

app.post('/api/class/join/:password/:name', async (req, res) => {
    const {password, name} = req.params
    let token = jwt.sign({password, name}, JWT_SECRET)
    addMemberToClass(password, token)
    res.status(200).json({token: token})
})



app.get('/api/class', authClassroom, async (req, res) => {
    let classroom = getClass(req.password)
    let members_names = classroom.members_tokens.map(membertoken => {
        let verify = jwt.verify(membertoken, JWT_SECRET)
        console.log(`verify ${JSON.stringify(verify)}`)
        return verify.name
        // verify.password
    });
    res.status(200).json({submissions: classroom.submissions, members: members_names})
})


app.post('/api/code/:lang', authClassroom, upload.single('file'), async (req, res) => {

    if (!getClass(req.password).open){
        return res.status(500).json({msg: 'sala está fechada'})
    }

    const code = req.file.buffer.toString('utf-8')
    const {lang} = req.params
    console.log(lang)

    result = await run_code(code, lang)

    addSubmissionToClass(req.password, {lang, code})

    // submissions.push({...result, code})
    console.log(result)
    res.json(result)


})

app.patch('/api/class/close', authClassroomTeacher, (req, res) => {
    console.log('finalizar envios', req.password)
    openClass(req.password, false)
    res.status(200).json(getClass(req.password).submissions)
})

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



app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

