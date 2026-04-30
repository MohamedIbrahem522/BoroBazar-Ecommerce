import Hello from './hello.schema.js';

export default class Services {
    constructor() {
        this.hello = Hello;
    }
    async printhello() {
        const getdata = await this.hello.find();
        return getdata;
    }

    async createHello(name) {
        const newHello = await this.hello.create({ name });
        return newHello;
    }
}