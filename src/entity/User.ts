// src/entity/User.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./Tenant.js";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar" })
    name: string;

    @Column({ unique: true, type: "varchar" })
    email: string;

    @Column({ type: "varchar" })
    role: string;

    @Column({ type: "varchar", select: false })
    password: string;

    @ManyToOne(() => Tenant)
    tenant: Tenant;
}
