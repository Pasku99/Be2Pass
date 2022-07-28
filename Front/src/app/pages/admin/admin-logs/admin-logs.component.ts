import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { Log } from 'src/app/models/log.model';

@Component({
  selector: 'app-admin-logs',
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.scss'],
})
export class AdminLogsComponent implements OnInit, AfterViewInit {
  logs: Log[] = [];
  displayedColumns: string[] = ['type', 'level', 'country', 'city', 'date'];
  dataSource = new MatTableDataSource<Log>(undefined);

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private readonly activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.getLogs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private getLogs(): void {
    this.activatedRoute.data.pipe(take(1)).subscribe((res) => {
      this.logs = res['logs']?.logs;
      this.dataSource = new MatTableDataSource<Log>(
        this.logs.concat([
          {
            type: 'Empleado creado con éxito',
            level: 'info',
            country: 'España',
            city: 'Alicante',
            date: '28-07-2022',
          },
          {
            type: 'Límite de intentos de contraseña maestra al compartir clave',
            level: 'warning',
            country: 'España',
            city: 'Alicante',
            date: '28-07-2022',
          },
          {
            type: 'Clave eliminada',
            level: 'warning',
            country: 'España',
            city: 'Alicante',
            date: '28-07-2022',
          },
          {
            type: 'Clave eliminada',
            level: 'warning',
            country: 'España',
            city: 'Alicante',
            date: '28-07-2022',
          },
          {
            type: 'Límite de intentos de contraseña maestra al compartir clave',
            level: 'warning',
            country: 'España',
            city: 'Alicante',
            date: '29-07-2022',
          },
        ])
      );
    });
  }
}
