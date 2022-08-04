import { Employee } from '../pages/models/employee-model';

export interface Workgroup {
  id?: string;
  name?: string;
  companyId?: string;
  employees?: Employee[];
}
