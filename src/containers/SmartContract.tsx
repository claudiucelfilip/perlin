import React, { Component } from 'react';
import { FileUploader } from '../components/FileUploader';
import { SmartContractStore, Payload } from '../store/SmartContractStore';
import { observer } from 'mobx-react';
import { PayloadViewer } from '../components/PayloadViewer';
import { FunctionSelector } from '../components/FunctionSelector';
import styled from 'styled-components';
import { getFunctionsFromFile } from '../contract/ContractParser';
import { MessageType, MessageBox } from '../components/MessageBox';

const Wrapper = styled.div`
  .title {
    text-align: center;
  }
  
  pre {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    margin-bottom: -3px;
    box-shadow: 0 5px #02040c;
  }
`;
@observer
export class SmartContract extends Component {
  private store = new SmartContractStore();
  state: any = {
    message: null
  };
  render() {
    return (
      <Wrapper>
        <div className="module">
          <h1 className="title">Smart Contract Analyzer</h1>
          <FileUploader file={this.store.file} onUpload={this.onFileUpload} onReset={this.onFileUploadReset} />
          <MessageBox message={this.state.message} onExpire={() => this.setState({message: null})}></MessageBox>
        </div>

        {this.store.functions.length !== 0 &&
          <FunctionSelector functions={this.store.functions} onChange={this.onChangeHandler} onSend={this.onSendHandler} />}
        {this.store.payload &&
          <PayloadViewer payload={this.store.payload} />}
        
      </Wrapper>
    );
  }

  onFileUpload = async (file: File) => {
    this.setState({message: null});
    try {
      this.store.functions = await getFunctionsFromFile(file);
      this.store.file = file;
    } catch (err) {
      this.setState({
        message: {
          type: MessageType.Error,
          text: err.message
        }
      });
      this.store.reset();
    }
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

    this.setState({
      message: {
        type: MessageType.Success,
        text: 'Transation sent sucessfully'
      }
    });
  }
}
