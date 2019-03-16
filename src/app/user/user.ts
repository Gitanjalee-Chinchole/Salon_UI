import { Role } from '../setting/role/role';

export class User {
    id: number;
    username: string;
    password: string;
    email: string;
    role: Role;
    floor: any;
    created_at: string;
    updated_at: any;
    deleted_at: string;
}
