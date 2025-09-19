const express = require('express');
const cors = require('cors');
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const jwt = require('jsonwebtoken')
// const bcrypt = require('bcrypt')
const crypto = require('crypto')

const {run_code} = require('./util/run_code')

const app = express();
const PORT = 3000;


app.use(cors({
    origin: '*'
}));
app.use(express.json())

let classrooms = new Map()


const JWT_SECRET = 'segredosecreto'




app.post('/api/class/create/:password', async (req, res) => {
    const {password} = req.params
    console.log('create', password)
    let token = jwt.sign({password: password}, JWT_SECRET)
    classrooms.set(token, {
        submissions: []
    })
    console.log(classrooms)
    res.status(200).json({token})
})

app.post('/api/class/join/:password', async (req, res) => {
    const {password} = req.params
    let token = jwt.sign({password: password}, JWT_SECRET)
    res.status(200).json({token})
})

function check_auth_classroom(headers){
    const {authorization} = headers
    if (!authorization){
        return res.status(500).json({error: 'token da classroom não foi especificado'}) 
    }
    const token = (authorization.split(' ')[1])
    if (!check_classroom(token)){
        return res.status(500).json({error: 'classroom não existe'}) 
    }

}

const auth_classroom = async (req, res, next) => {
    const {header_auth} = req.headers
    const token = header_auth && header_auth.split(' ')[1]
    if (!token){
        return res.status(500).json({error: 'token da classroom não foi especificado'})
    }

    next()

}

app.get('/api/class/submission', async (req, res) => {

    res.status(200).json(classrooms.get())
})

function check_classroom(token){
    return classrooms.has(token)
}

app.post('/api/code/:lang', upload.single('file'), async (req, res) => {
    console.log(req.headers)
    check_auth_classroom(req.headers)

    const code = req.file.buffer.toString('utf-8')
    const {lang} = req.params
    console.log(lang)

    result = await run_code(code, lang)

    classrooms.get(token).submissions.push({lang, code: code})

    // submissions.push({...result, code})
    console.log(result)
    res.json(result)


})

app.get('/api/update', (req, res) => {
    res.status(200).json(submissions)
})



app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

