import type { Request } from "express";
export interface UserData {
    name: string;
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}
