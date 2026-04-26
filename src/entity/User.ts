// src/entity/User.ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar" })
    name: string;

    @Column({ unique: true, type: "varchar" })
    email: string;

    @Column({ type: "varchar" })
    role: string;

    @Column({ type: "varchar" })
    password: string;
}
