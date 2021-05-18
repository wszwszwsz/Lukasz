// TODO : add auth

const authUser = () => {
    const getCookies = () => {
        return document.cookie.split('; ').reduce((prev, current) => {
            const [name, ...value] = current.split('=');
            prev[name] = value.join('=');
            return prev;
        }, {});
    }

    const cookies = getCookies();

    const { userAuthenticated } = cookies;
    console.log(userAuthenticated)
    debugger;

    if (!userAuthenticated) {
        window.location.href = "login.html";
    }
}
document.onload = authUser();
