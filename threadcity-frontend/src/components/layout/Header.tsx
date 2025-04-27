import React from 'react';

const Header = () => {
    return (
        <header>
            <h1>ThreadCity</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/login">Login</a></li>
                    <li><a href="/register">Register</a></li>
                    <li><a href="/profile">Profile</a></li>
                    <li><a href="/forgot-password">Forgot Password</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;