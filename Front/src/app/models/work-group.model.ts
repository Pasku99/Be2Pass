import { Employee } from '../pages/models/employee-model';

export interface WorkGroup {
  id?: string;
  name?: string;
  companyId?: string;
  employees?: Employee[];
}
