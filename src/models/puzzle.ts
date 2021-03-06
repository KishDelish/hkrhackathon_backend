export class Puzzle {
    private _nameFirstSolved: string;
    private _timeFirstSolved: Date;
    private _wrongSubmissions: number;
    private _correctSubmissions: number;

    constructor(
        private _id: string,
        private _title: string,
        private _story: string,
        private _examples: string[]
    ) { }


    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get story(): string {
        return this._story;
    }

    set story(value: string) {
        this._story = value;
    }


    get examples(): string[] {
        return this._examples;
    }

    set examples(value: string[]) {
        this._examples = value;
    }

    get timeFirstSolved(): Date {
        return this._timeFirstSolved;
    }

    set timeFirstSolved(value: Date) {
        this._timeFirstSolved = value;
    }

    get correctSubmissions(): number {
        return this._correctSubmissions;
    }

    set correctSubmissions(value: number) {
        this._correctSubmissions = value;
    }

    get nameFirstSolved(): string {
        return this._nameFirstSolved;
    }

    set nameFirstSolved(value: string) {
        this._nameFirstSolved = value;
    }

    get wrongSubmissions(): number {
        return this._wrongSubmissions;
    }

    set wrongSubmissions(value: number) {
        this._wrongSubmissions = value;
    }
}
