import { User } from './user.model';
import { WorkGroup } from './work-group.model';

export interface Key {
  id?: string;
  key?: string;
  user?: User;
  username?: string;
  service?: string;
  URL?: string;
  isShared?: boolean;
  workGroups?: WorkGroup[];
}
