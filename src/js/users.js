var objPeople = [
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

const form = document.getElementById('login-form');
form.addEventListener('submit', auth);


function auth(e) {
    e.preventDefault();

    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    let messages = []
    if (username.value === '' || name.value == null ){
        messages.push('Name is required')
    }

    let foundUsers =  objPeople.filter(u=> {
        return u.username === username && u.password === password ? u: null;
    })


    if(foundUsers.length >= 1) {
        document.cookie = "userAuthenticated=true";
        window.location.href = "index.html";
    }
}



