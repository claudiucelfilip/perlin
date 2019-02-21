import { observable, action } from 'mobx';
import fp from 'lodash/fp';

export interface Payload {
  func_name: string;
  func_params: number[];
}
export interface PayloadWrapper {
  tag: string;
  payload: Payload;
}
export class SmartContractStore {
  @observable functions: string[] = [];
  @observable payload: PayloadWrapper;
  @observable file: File = null;

  @action send() {
    console.log('sending payload', JSON.stringify(this.payload));
  }

  @action reset() {
    this.functions = [];
    this.payload = null;
    this.file = null;
  }
}

