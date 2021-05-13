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
// async function basiclogin () {
//     var username = document.getElementById("username").value;
//     var password = document.getElementById("password").value;
//
//     const response = await zlFetch.post(loginEndpoint, {
//         auth: {
//             username: username,
//             password: password
//         },
//         body: { /*...*/ }
//     })
// }

function getInfo(){
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    for(var i = 0; i < objPeople.length; i++){
        if(username == objPeople[i].username
            && password == objPeople[i].password) {
            alert(username + " jest zalogowany!");
            console.log(username + " jest zalogowany!");
            window.location.replace("index.html");
            return;
        }
        alert("Nieprawidłowy użytkownik lub hasło");
        console.log("Nieprawidłowy użytkownik lub hasło");
        window.location.replace("login.html");
    }

}





// const loginForm = document.getElementById("login-form");
// const loginButton = document.getElementById("login-form-submit");
// const loginErrorMsg = document.getElementById("login-error-msg");
//
// loginButton.addEventListener("click", (e) => {
//     e.preventDefault();
//     const username = loginForm.username.value;
//     const password = loginForm.password.value;
//
//     if (username === "user" && password === "web_dev") {
//         alert("You have successfully logged in.");
//         location.reload();
//     } else {
//         loginErrorMsg.style.opacity = 1;
//     }
// })

// var username = document.getElementById("username").value;
// var password = document.getElementById("password").value;
// async function basiclogin (email, password) {
//     const response = await zlFetch.post(loginEndpoint, {
//         auth: {
//             username: email,
//             password: password
//         },
//         body: { /*...*/ }
//     })
// }
