const logoutButton = document.querySelector('#logout');

const getCookies = () => {
    return document.cookie.split('; ').reduce((prev, current) => {
        const [name, ...value] = current.split('=');
        prev[name] = value.join('=');
        return prev;
    }, {});
}

function delete_cookie( name ) {
    let cookies = getCookies();

    if(Object.keys(cookies).includes(name)) {
        document.cookie = name+"=";
    }
}

const logoutUser = () => {
    delete_cookie("userAuthenticated");
    window.location.href = "login.html";
};

logoutButton.addEventListener('click', logoutUser);
