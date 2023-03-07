import { AuthGuard } from "@nestjs/passport";

export class Jwt2faGuard extends AuthGuard('jwt-2fa') {}
