let classrooms = new Map()



function getClass(password){
    return classrooms.get(password)
}

function getClasses(){
    // !!! RETORNANDO O TOKENTEACHER
    return classrooms
}

function createClass(password, tokenteacher){
    classrooms.set(password, {submissions: [], members_tokens: [], open: true, tokenteacher, submissions_responses: {}})
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
    if (classroom){
        classroom.members_tokens.push(membertoken)
        return true
    } else {
        return false
    }
}

function removeMemberFromClass(password, membertoken){
    let classroom = classrooms.get(password)
    classroom.members_tokens = classroom.members_tokens.filter(token => token != membertoken)
    return true
}

function getResponses(membertoken){
    let classroom = classrooms.get(password)
    if (!classroom){
        console.log(`classroom ${password} dont exist`)
        return false
    }
    let responses = Object.values(classroom.submissions_responses).reduce((acc, cur) => {
        if (acc.membertoken == membertoken){
            acc.push(cur)
        }
    }, [])
    return responses
}

function addResponseToClass(code, password, respondenttoken, membertoken){
    let classroom = classrooms.get(password)
    if (!classroom){
        console.log(`classroom ${password} dont exist`)
        return false
    }
    classroom.submissions_responses[respondenttoken] = {membertoken, code}
    return true
}


module.exports = {
    getClass, getClasses, addSubmissionToClass, createClass, deleteClass, openClass, addMemberToClass, removeMemberFromClass, getResponses, addResponseToClass
}