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
const {getClass, getClasses, addSubmissionToClass, createClass, openClass} = require('./classrooms')

const app = express();
const PORT = 3000;


app.use(cors({
    origin: '*'
}));
app.use(express.json())






app.post('/api/class/create/:password', async (req, res) => {
    const {password} = req.params
    console.log('create', password)
    // let token = jwt.sign({password: password}, JWT_SECRET)
    // let token = await bcrypt.hash(password, 12)
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let token = ''
    for(let i = 0; i < 16; i++){
        token += characters.charAt(Math.random() * characters.length)
    }
    createClass(password, token)
    res.status(200).json({token})
})

app.post('/api/class/join/:password', async (req, res) => {
    const {password} = req.params
    // let token = jwt.sign({password: password}, JWT_SECRET)
    res.status(200).json({success: true})
})



app.get('/api/class/submission', authClassroom, async (req, res) => {
    res.status(200).json(getClass(req.password))
})


app.post('/api/code/:lang',  authClassroom, upload.single('file'), async (req, res) => {

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
    console.log(req.password)
    openClass(req.password, false)
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

