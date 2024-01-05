export default class Alert {
  constructor(
    readonly id: string,
    readonly max_amount: number,
    readonly min_amount: number,
    readonly type: 'greater_than' | 'lower_than'
  ) { }
}