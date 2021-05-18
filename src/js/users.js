const DB = {
    users: [
        {
            username: "Pracownik",
            password: "haslo@123"
        },
        {
            username: "Krzysztof",
            password: "abcd"
        },
        {
            username: "Wojciech",
            password: "Egzamin"
        }
    ]
}

// TODO: import data from DB

const form = document.getElementById('login-form');
form.addEventListener('submit', auth);

function auth(e) {
    e.preventDefault();

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    let foundUsers =  DB.users.filter(u => u.username === username && u.password === password ? u: null)

    if(foundUsers.length >= 1) {
        document.cookie = "userAuthenticated=true";
        window.location.href = "index.html";
    }
}



