import React, { useState, ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';
import fp from 'lodash/fp';
import { SmartBuffer } from 'smart-buffer-64';
import { Payload } from '../store/SmartContractStore';
import { MessageType, MessageBox } from './MessageBox';

export interface ContractFunctionProps {
  name: string;
  onChange: (payload: Payload) => void;
  onSend: () => void;
}

enum ParamTypes {
  String = 'String',
  UInt8 = 'UInt8',
  UInt16 = 'UInt16',
  UInt32 = 'UInt32',
  UInt64 = 'UInt64',
  Bytes = 'Bytes'
}
class Param {
  constructor(public type: ParamTypes = ParamTypes.String, public value: string = '') { }
};

const Wrapper = styled.div`
  .message-box {
    border-radius: 0;
  }
`;

const replaceAt = (index: number, value: any, array: any[]) => {
  const newArray = [...array];
  newArray[index] = value;
  return newArray;
};

const useParamsHook = (props: ContractFunctionProps) => {
  const [params, setParams] = useState<Param[]>([new Param()]);
  const [message, setMessage] = useState(undefined);

  useEffect(() => {
    try {
      setMessage(undefined);
      processFunctionParams(props, params);
    } catch (err) {
      setMessage({
        type: MessageType.Error,
        text: err.message
      });
    }
  }, [params]);

  const setParamValue = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const newParam = fp.set('value', event.target.value, params[index])
    setParams(replaceAt(index, newParam, params));
  };

  const setParamType = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const newParam = fp.set('type', event.target.value, params[index])
    setParams(replaceAt(index, newParam, params));
  };

  const addParam = () => {
    setParams([...params, new Param()]);
  };
  const removeParam = (index: number) => () => {
    setParams(params.filter((_, i: number) => i !== index));
  };

  return { message, setMessage, params, setParamValue, setParamType, addParam, removeParam };
}

export const ContractFunction: React.SFC<ContractFunctionProps> = (props: ContractFunctionProps) => {
  const { message, setMessage, params, setParamValue, setParamType, addParam, removeParam } = useParamsHook(props);

  return (
    <Wrapper>
      <div className="flat-control-row">
        {params.map((param: Param, index: number) => (
          <React.Fragment key={index}>
            <input className="flat-control" type="text" onChange={setParamValue(index)} />
            <select className="flat-control" onChange={setParamType(index)}>
              {Object.keys(ParamTypes).map((key: string) =>
                <option key={key} value={key}>{key}</option>)}
            </select>
            <a className="flat-control flat-control--remove" onClick={removeParam(index)}></a>
          </React.Fragment>
        ))}
        <a className="flat-control flat-control--add" onClick={addParam}></a>
        <button className="flat-control flat-control--submit" onClick={() => props.onSend()}>Send</button>
      </div>
      <MessageBox message={message} onExpire={() => setMessage(null)}></MessageBox>
    </Wrapper>
  )
};

const processFunctionParams = (props: ContractFunctionProps, params: Param[]) => {
  const buffer = params
    .filter((param: Param) => param.value.length)
    .reduce((buffer: SmartBuffer, { type, value }: Param) => {
      switch (type) {
        case ParamTypes.Bytes:
        case ParamTypes.String:
          buffer.writeUInt32LE(value.length);
          buffer.writeBuffer(Buffer.from(value));
          break;
        case ParamTypes.UInt8:
          buffer.writeUInt8(parseInt(value, 10));
          break;
        case ParamTypes.UInt16:
          buffer.writeUInt16LE(parseInt(value, 10));
          break;
        case ParamTypes.UInt32:
          buffer.writeUInt32LE(parseInt(value, 10));
          break;
        case ParamTypes.UInt64:
          buffer.writeUInt64LE(parseInt(value, 10));
          break;
      }
      return buffer;

    }, new SmartBuffer());


  props.onChange({
    func_name: props.name,
    func_params: [...buffer.toBuffer()]
  });
};

