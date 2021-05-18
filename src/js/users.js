let DB = await getUsers();

// TODO: import data from DB

const form = document.getElementById('login-form');
form.addEventListener('submit', auth);

async function getUsers() {
    fetch('http://localhost:8001/users')
        .then(response => response.json())
        .then(data => DB = data);
}

const getUser = async (id) => {
    fetch(`http://127.0.0.1:8001/users?id=${id}`)
        .then(response => response.json())
        .then(data => console.log(data));
}

const getAuth = async (uname, upass) => {
    let shouldAuthenticate;
    fetch(`http://127.0.0.1:8001/auth?username=${uname}&password=${upass}`)
        .then(response => {
            // if reponse 200 then auth
            if(response.status === 200) shouldAuthenticate = true;
        })

    return shouldAuthenticate;
}

async function auth(e) {
    e.preventDefault();

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    let shouldBeAuthenticated = await getAuth(username, password)

    if(shouldBeAuthenticated) {
        document.cookie = "userAuthenticated=true";
        window.location.href = "index.html";
    }
}