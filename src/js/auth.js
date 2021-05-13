// TODO : add auth

const authUser = () => {
    const cookies = document.cookie.split('; ').reduce((prev, current) => {
        const [name, ...value] = current.split('=');
        prev[name] = value.join('=');
        return prev;
      }, {});

    const { userAuthenticated } = cookies;
    console.log(userAuthenticated)
    debugger;

    if (userAuthenticated) {
        alert("Let's go!");
        // window.location.href = "/index.html";
        document.location.replace("/login.html");
    } else {
        // window.location.href = "/login.html";
        document.location.replace("/index.html");
    }
}

document.onload = authUser();