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

    if (!userAuthenticated) {
        window.location.href = "login.html";
    }
}

        // TODO: add logic to handle user coming from /index.html


document.onload = authUser();
