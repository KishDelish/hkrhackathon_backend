import users from '../routes/users';
import login from '../routes/login';
import admin from '../routes/admins';
import puzzles from '../routes/puzzles';
import leaderboard from "../routes/leaderboard";

import error from '../middleware/error'
import express from "express";

export default function (app) {
    app.use(express.json());
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Expose-Headers', 'x-auth-header');
        res.header('Access-Control-Allow-Methods', '*');
        next();
    });
    app.use('/user', users);
    app.use('/login', login);
    app.use('/admin', admin);
    app.use('/puzzles', puzzles);
    app.use('/leaderboard', leaderboard);
    app.use(error);
}
