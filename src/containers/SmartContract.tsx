import React, { Component } from 'react';
import { FileUploader } from '../components/FileUploader';
import { SmartContractStore, Payload } from '../store/SmartContractStore';
import { observer } from 'mobx-react';
import { PayloadViewer } from '../components/PayloadViewer';
import { FunctionSelector } from '../components/FunctionSelector';


@observer
export class SmartContract extends Component {
  private store = new SmartContractStore();

  render() {
    return (
      <div>
        <h1>Smart Contract Analyzer</h1>
        <FileUploader onUpload={this.onParsedContract} onReset={this.onFileUploadReset}/>
        {this.store.functions.length !== 0 &&
          <FunctionSelector functions={this.store.functions} onChange={this.onChangeHandler} onSend={this.onSendHandler} />}
        {this.store.payload &&
          <PayloadViewer payload={this.store.payload} />}
      </div>
    );
  }

  onParsedContract = (fns: string[]) => {
    this.store.functions = fns;
  }
  onFileUploadReset = () => {
    this.store.reset();
  }

  onChangeHandler = (payload: Payload) => {
    this.store.payload = {
      tag: 'contract',
      payload
    };
  }

  onSendHandler = () => {
    this.store.send();
  }
}
