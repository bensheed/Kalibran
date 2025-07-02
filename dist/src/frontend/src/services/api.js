"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const api = axios_1.default.create({
    baseURL: API_URL,
});
exports.default = api;
