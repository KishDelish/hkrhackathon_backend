import { UserPuzzle } from "./userPuzzle";
import jwt from 'jsonwebtoken';

export class User {
    private _currentPuzzleId: string;
    private _isAdmin: boolean;
    private _userPuzzles: {
        [puzzleId: string]: UserPuzzle
    } = {};

    constructor(
        private _name: string,
        private _email: string,
        private _password: string,
        private _year: number) {
    }


    get userPuzzles(): { [p: string]: UserPuzzle } {
        return this._userPuzzles;
    }

    set userPuzzles(value: { [p: string]: UserPuzzle }) {
        this._userPuzzles = value;
    }

    get email(): string {
        return this._email;
    }

    set password(value) {
        this._password = value;
    }

    get password() {
        return this._password;
    }

    get name() {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get year() {
        return this._year;
    }

    set year(value: number) {
        this._year = value;
    }

    get currentPuzzleId(): string {
        return this._currentPuzzleId;
    }

    set currentPuzzleId(value: string) {
        this._currentPuzzleId = value;
    }

    get isAdmin() {
        return this._isAdmin;
    }

    set isAdmin(value: boolean) {
        this._isAdmin = value;
    }

    addPuzzle(puzzle: UserPuzzle) {
        this._currentPuzzleId = puzzle.id
        this._userPuzzles[puzzle.id] = puzzle;
    }

    getPuzzle(id: string) {
        return this._userPuzzles[id];
    }

    updatePuzzle(puzzle: UserPuzzle) {
        this._userPuzzles[puzzle.id] = puzzle;
    }

    removePuzzles() {
        this._userPuzzles = {};
    }

    generateAuthToken = function () {
        return jwt.sign({
            email: this._email,
            isAdmin: this._isAdmin
        },
            process.env.JWT_KEY,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            })
    }
}
