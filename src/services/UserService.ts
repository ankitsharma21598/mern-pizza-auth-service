import { Repository } from "typeorm";
import { User } from "../entity/User.js";
import { UserData } from "../types/index.js";
import createHttpError from "http-errors";
import { USER_ROLES } from "../constants/index.js";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {
        this.userRepository = userRepository;
    }
    async create({ name, email, password }: UserData): Promise<User> {
        // Check if the email already exists
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw createHttpError(400, "Email already exists");
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // console.log({ hashedPassword, password });
        try {
            return this.userRepository.save({
                name,
                email,
                password: hashedPassword,
                role: USER_ROLES.CUSTOMER,
            });
        } catch {
            const error = createHttpError(500, "Failed to create user");
            throw error;
        }
    }
}
