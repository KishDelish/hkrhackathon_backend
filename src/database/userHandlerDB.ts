import { dbUser } from "./models/db_users"
import { User } from "../models/user"
import { dbUserPuzzle } from "./models/db_userPuzzle"

/** Class for handling all db interactions */
export class UserHandlerDB {
    // Upon creating the class, the boot method connects to the db.

    userDeconstruct(user) {
        return new dbUser({ name: user._name, email: user._email, password: user._password, year: user._year, currentPuzzleId: user._currentPuzzleId, userPuzzles: this.userPuzzleDeconstruct(user._userPuzzles), isAdmin: user._isAdmin })
    }

    userPuzzleDeconstruct(userPuzzleList) {
        let upList = []
        for (let userPuzzle of userPuzzleList) {
            upList.push(new dbUserPuzzle({ userinput: userPuzzle._userInput, answer: userPuzzle._answer, completionTime: userPuzzle._completionTime, numberOfWrongSubmissions: userPuzzle._numberOfWrongSubmissions, completed: userPuzzle._completed }))
        }
        return upList
    }

    userReconstruct(dbuser) {
        const uObject = new User(dbuser.name, dbuser.email, dbuser.password, dbuser.year)
        for (let i of dbuser.userPuzzles) {
            uObject.addPuzzle(i)
        } if (dbuser.currentPuzzleId) {
            uObject.currentPuzzleId = dbuser.currentPuzzleId;
        } if (dbuser.isAdmin) {
            uObject.isAdmin = dbuser.isAdmin
        }
        return uObject
    }


    async saveUserObject(user) { // tested and working, missing existing check
        const newUser = this.userDeconstruct(user)
        await newUser.save();
        return newUser // Return db user or user
    }

    async getUserObject(email) { // tested and working
        // fetches a single user from the database and sends an object back.
        const user = await dbUser.findOne({ email: email })
        if (user) {
            return this.userReconstruct(user)
        } else {
            return { error: 'User not found.' }
        }
    }

    async getAllUserObject() { // tested and working
        // returns an array of all users in the database
        const users = await dbUser.find();
        let userList = []
        for (let i in users) {
            userList.push(this.userReconstruct(i))
        }
        return userList
    }

    async deleteUserObject(email) { // Returns deleted count. If 0, error. If 1, success.
        // deletes user from the database, ADMIN ONLY
        const user = await dbUser.findOne({ email: email })
        if (user) {
            await dbUser.deleteOne({ email: email })
            return this.userReconstruct(user)
        } else {
            return { error: 'User not found.' }
        }
    }

    async updateUserObject(user) { // discuss with Aki, currently searches by email. Tested and working
        // updates a user in the database.
        const userInfo = this.userDeconstruct(user)
        const res = await dbUser.findOneAndUpdate({ email: userInfo.email }, { name: userInfo.name, email: userInfo.email, password: userInfo.password, year: userInfo.year, currentPuzzleId: userInfo.currentPuzzleId, userPuzzles: userInfo.userPuzzles, isAdmin: userInfo.isAdmin });
        if (res) {
            return res
        } else {
            return { error: "User update failed, user not found." }
        }
    }
}
