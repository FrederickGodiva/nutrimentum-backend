import {User} from "../generated/prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: User;
}