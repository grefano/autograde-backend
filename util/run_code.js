const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')

async function run_code(code, lang){

    // criando arquivo pra executar
    const sourceFile = path.join('./temp', 'temp.'+lang)
    if (!fs.existsSync('./temp')){
        fs.mkdirSync('./temp')
    }

    fs.writeFileSync(sourceFile, code)

    switch(lang){
        
        case 'py':
            return new Promise((resolve) => {
                const timeStart = Date.now()
                exec(`python "${sourceFile}"`, {timeout: 5000}, (runError, stdout, stderr) => {
                    const execTime = (Date.now() - timeStart) / 1000
                    console.log(runError, stderr)
                    if (runError){
                        resolve({success: false, output: stdout}) 
                    } else {
                        resolve({success: true, execTime, output: stdout})
                    }
                })
            })
            break;
            
        case 'c':
            const exeFile = path.join('./temp', 'temp.exe')


            return new Promise((resolve) => {
                exec(`gcc "${sourceFile}" -o "${exeFile}"`, (compileError) => {
                    if(compileError){
                        return res.json({error: compileError.message})
                    }
                    const timeStart = Date.now()
                    exec(`"${exeFile}"`, {timeout: 5000}, (runError, stdout, stderr) => {
                        fs.unlinkSync(sourceFile)
                        fs.unlinkSync(exeFile)
                        const execTime = (Date.now() - timeStart) / 1000
                        if (runError){
                            resolve({success: false, output: stdout}) 
                        } else {
                            resolve({success: true, execTime, output: stdout})
                        }
                    })
                    
                })

            })



            break;
        default:
            return new Promise((resolve) => {
                resolve({success: false, output: `arquivos '.${lang}' não são aceitos pelo sistema`})
            })
    }
}

module.exports = {
    run_code
}