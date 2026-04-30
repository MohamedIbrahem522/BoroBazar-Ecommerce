import Services from "./hello.services.js";

export default class Controller {
    constructor() {
        this.services = new Services();

    }
    async printHello(req, res) {
        const message = await this.services.printhello();
        res.send(message);
    }
    async createHello(req, res) {
        const { name } = req.body;
        res.send(await this.services.createHello(name));
        // Here you can add logic to save the name to the database using a model
    }



}