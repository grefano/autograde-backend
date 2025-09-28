let classrooms = new Map()



function getClass(password){
    return classrooms.get(password)
}

function getClasses(){
    // !!! RETORNANDO O TOKENTEACHER
    return classrooms
}

function createClass(password, tokenteacher){
    classrooms.set(password, {submissions: [], members_tokens: [], open: true, tokenteacher})
}

function deleteClass(password){
    classrooms.delete(password)
}

function addSubmissionToClass(password, submission){
    classroom = classrooms.get(password)
    console.log(classroom)
    classroom.submissions.push(submission)
    return true
}
function openClass(password, value){
    classrooms.get(password).open = value
}

function addMemberToClass(password, membertoken){
    let classroom = classrooms.get(password)
    classroom.members_tokens.push(membertoken)
    return true
}

function removeMemberFromClass(password, membertoken){
    let classroom = classrooms.get(password)
    classroom.members_tokens = classroom.members_tokens.filter(token => token != membertoken)
    return true
}


module.exports = {
    getClass, getClasses, addSubmissionToClass, createClass, deleteClass, openClass, addMemberToClass, removeMemberFromClass
}