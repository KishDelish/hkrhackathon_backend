import { Puzzle } from "../models/puzzle";
import { dbPuzzle } from "./models/db_puzzles";
import { dbpuzzleStorage } from "./models/db_puzzleStorage"

/** Class for handling all db interactions */
export class PuzzleHandlerDB {

    puzzleDeconstruct(puzzle) {
        return new dbPuzzle({ id: puzzle.id, title: puzzle.title, story: puzzle.story, examples: puzzle.examples })
    }

    puzzleReconstruct(dbpuzzle) {
        const puzz = new Puzzle(dbpuzzle.id, dbpuzzle.title, dbpuzzle.story, dbpuzzle.examples)
        return puzz
    }

    async savePuzzle(puzzle: Puzzle): Promise<Puzzle | { error: string; }> {
        // saves a puzzle to the database.
        const newPuzzle = this.puzzleDeconstruct(puzzle)
        await newPuzzle.save();
        return this.puzzleReconstruct(newPuzzle)
    }

    async getPuzzle(puzzleId: string): Promise<Puzzle | { error: string; }> {
        // returns a puzzle from the database.
        const puzzle = await dbPuzzle.findOne({ id: puzzleId })
        if (puzzle) {
            return this.puzzleReconstruct(puzzle)
        } else {
            return { error: 'Puzzle not found.' }
        }
    }

    async getAllPuzzles(): Promise<Puzzle[] | { error: string }> {
        // returns an array of all users from the database.
        const puzzles = await dbPuzzle.find();
        let puzzleList = [];
        if (puzzles.length == 0) return { error: "No puzzles in database." }

        for (const i of puzzles) {
            puzzleList.push(this.puzzleReconstruct(i))
        }
        return puzzleList


    }

    async getNextPuzzleId(id?: string): Promise<string | { error: string; }> {
        // if you get an argument, return right puzzle. Else, first puzzle.
        const orderArray = await dbpuzzleStorage.find();
        const returnPuzzle = []
        if (orderArray.length == 0) return { error: "orderArray missing." }
        for (const puzzle of orderArray) {
            if (puzzle.visiblity) {
                returnPuzzle.push(puzzle.puzzleid)
            }
        }
        if (returnPuzzle.length == 0) { return { error: "Error while browsing Puzzles." } }
        if (id == undefined) { return returnPuzzle[0] }
        let next = false;
        for (let i of returnPuzzle) {
            if (next) { return i }
            if (i == id) {
                next = true;
            }
        }
    }

    async updatingPuzzleStorage(orderArray: [{ id: string, visiblity: boolean }]): Promise<[{ id: string, visiblity: boolean }]> {
        // updates puzzle storage array
        return await new dbpuzzleStorage(orderArray).save()
    }
}

    /* async changePuzzleVisibility(id: string, visiblity: boolean): Promise<string | { error: string; }> {
         const puzzle = await dbpuzzleStorage.findOne({ puzzleid: id });
         if (puzzle) {
             puzzle.public = visiblity;
             return puzzle.puzzleid
         } else { return { error: "No such puzzle found." } }
        }
    */



    /*async delPuzzleFromStorage(id: string): Promise<string | { error: string; }> {
        const puzzle = await dbpuzzleStorage.findOne({ id: id });
        if (puzzle) {
            const puzzleRet = await puzzle.deleteOne({ id: id })
            if (puzzleRet === 1) {
                return puzzle.id
            } else { return { error: "Error while deleting." } }
        } else {
            return { error: "Puzzle not found." }

        }
    }
    */

}
