export class ModalGeneralModel {
  constructor(
    public title: string = '',
    public subtitle: string = '',
    public icon: string = '',
    public message: string = '',
    public action: string = '', //lista de acciones predefinidas, dependiendo del action se mostrara unos botones u otros
    public data: any[] = []
  ) {}
}
