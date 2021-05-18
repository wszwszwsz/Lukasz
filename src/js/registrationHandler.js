const registrationButton = document.querySelector('#registration');

const registerUser = (e) => {
    e.preventDefault();

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    let foundUsers =  DB.users.filter(u => u.username === username && u.password === password ? u: null)

    if(foundUsers.length >= 1) {
        alert("You are already registered!")
    }
}

logoutButton.addEventListener('click', registerUser);
