import { User } from './user.model';
import { Workgroup } from './work-group.model';

export interface Key {
  id?: string;
  key?: string;
  user?: User;
  username?: string;
  service?: string;
  URL?: string;
  isShared?: boolean;
  workgroups?: Workgroup[];
}
