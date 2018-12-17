import { Injectable, EventEmitter } from "@angular/core";


@Injectable({
    providedIn: "root"
})
export class FilesModalController {
    public hidden: string = "hidden";
    public id: string
    public notification = new EventEmitter<any>();

    constructor() { }

    hideModal() {
        this.hidden = "hidden";
        this.id = ''
    }

    showModal(id?: string) {
        this.hidden = "";
        this.id = id
    }

}