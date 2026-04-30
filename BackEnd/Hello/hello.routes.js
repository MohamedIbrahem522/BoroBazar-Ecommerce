import { Router } from "express";
import Controller from './hello.controller.js';

export const router = Router();
const controller = new Controller();

router.get('/hello', controller.printHello.bind(controller));
router.post('/hello', controller.createHello.bind(controller));