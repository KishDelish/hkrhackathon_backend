import { dbUser } from "./models/db_users"

import { User } from "../models/user"


/** Class for handling all db interactions */
export class UserHandlerDB {
    // Upon creating the class, the boot method connects to the db.

    userDeconstruct(user: User) {
        return new dbUser({ name: user.name, email: user.email, password: user.password, year: user.year, currentPuzzleId: user.currentPuzzleId, userPuzzles: user.userPuzzles, isAdmin: user.isAdmin })
    }

    userReconstruct(dbuser) {
        const uObject = new User(dbuser.name, dbuser.email, dbuser.password, dbuser.year)
        uObject.userPuzzles = dbuser.userPuzzles;
        uObject.currentPuzzleId = dbuser.currentPuzzleId;
        uObject.isAdmin = dbuser.isAdmin
        return uObject
    }


    async saveUserObject(user: User): Promise<User | { error: string; }> {
        // saves a user to the database.
        const newUser = this.userDeconstruct(user)
        await newUser.save();
        return this.userReconstruct(newUser)
    }

    async getUserObject(email): Promise<User | { error: string; }> {
        // fetches a single user from the database and sends an object back.
        const user = await dbUser.findOne({ email: email })
        if (user) {
            return this.userReconstruct(user)
        } else {
            return { error: 'User not found.' }
        }
    }

    async getAllUserObject(): Promise<any[]> {
        // returns an array of all users in the database.
        const users = await dbUser.find();
        let userList = []
        for (let i in users) {
            userList.push(this.userReconstruct(i))
        }
        return userList
    }

    async deleteUserObject(email): Promise<User | { error: string; }> {
        // deletes user from the database.
        const user = await dbUser.findOne({ email: email })
        if (user) {
            await dbUser.deleteOne({ email: email })
            return this.userReconstruct(user)
        } else {
            return { error: 'User not found.' }
        }
    }

    async updateUserObject(user): Promise<User | { error: string; }> {
        // updates a user in the database.
        const userInfo = this.userDeconstruct(user)
        const res = await dbUser.findOneAndUpdate({ email: userInfo.email }, { name: userInfo.name, email: userInfo.email, password: userInfo.password, year: userInfo.year, currentPuzzleId: userInfo.currentPuzzleId, userPuzzles: userInfo.userPuzzles, isAdmin: userInfo.isAdmin });
        if (res) {
            return await dbUser.findOne({ email: userInfo.email })
        } else {
            return { error: "User update failed, user not found." }
        }
    }
}
