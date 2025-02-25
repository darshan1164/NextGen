document.getElementById("show-signup").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("login-box").style.display = "none";
    document.getElementById("signup-box").style.display = "block";
});

document.getElementById("show-login").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("signup-box").style.display = "none";
    document.getElementById("login-box").style.display = "block";
});

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;

    console.log(`Attempting login with username: ${username}, password: ${password}`);

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        console.log(`Login response:`, result);

        if (result.status === 'success') {
            // Store user_id in localStorage
            localStorage.setItem('user_id', result.user_id);
            if (result.role === 'admin') {
                window.location.href = '/Admin/admin.html';
            } else if (result.role === 'staff') {
                window.location.href = '/Staff/staff.html';
            } else {
                window.location.href = '/Customer/menu.html';
            }
        } else {
            alert('User not found. Please sign up first.');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});

document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;

    console.log(`Attempting sign up with username: ${username}, password: ${password}`);

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role: 'customer' })
        });

        const result = await response.json();
        console.log(`Sign up response:`, result);

        if (result.status === 'success') {
            alert('Sign up successful! Please log in now.');
            document.getElementById("signup-box").style.display = "none";
            document.getElementById("login-box").style.display = "block";
        } else {
            alert('Sign up failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during sign up:', error);
    }
});
