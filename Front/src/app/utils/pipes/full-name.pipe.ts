import { Pipe, PipeTransform } from '@angular/core';
import { Employee } from 'src/app/pages/models/employee-model';

@Pipe({
  name: 'fullName',
})
export class FullNamePipe implements PipeTransform {
  transform(employee: Employee): string {
    return employee.secondSurname
      ? employee.name +
          ' ' +
          employee.firstSurname +
          ' ' +
          employee.secondSurname
      : employee.name + ' ' + employee.firstSurname;
  }
}
