let classrooms = new Map()



function getClass(token){
    return classrooms.get(token)
}

function getClasses(){
    // !!! RETORNANDO O TOKENTEACHER
    return classrooms
}

function createClass(token, tokenteacher){
    classrooms.set(token, {submissions: [], open: true, tokenteacher})
}
function addSubmissionToClass(token, submission){
    classroom = classrooms.get(token)
    console.log(classroom)
    classroom.submissions.push(submission)
    return true
}
function openClass(token, value){
    classrooms.get(token).open = value
}

module.exports = {
    getClass, getClasses, addSubmissionToClass, createClass, openClass
}