import React, { useState, ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';
import fp from 'lodash/fp';
import { SmartBuffer } from 'smart-buffer-64';
import { Payload } from '../store/SmartContractStore';
import { MessageType, MessageBox, Message } from './MessageBox';

const Wrapper = styled.div`
  .message-box {
    border-radius: 0;
  }
`;

export interface ContractFunctionProps {
  name: string;
  onChange: (payload: Payload) => void;
  onSend: () => void;
}

export const ContractFunction: React.SFC<ContractFunctionProps> = (props: ContractFunctionProps) => {
  const { message, setMessage, params, setParamValue, setParamType, addParam, removeParam, resetParamValues } = useParamsHook(props);
  const { onSend } = props;

  return (
    <Wrapper>
      <div className="flat-control-row">
        {params.map((param, index: number) => (
          <React.Fragment key={index}>
            <input
              className="flat-control"
              type="text"
              value={param.value}
              placeholder={'Enter a ' + param.type + ' value'}
              onChange={setParamValue(index)} />
            <select className="flat-control" onChange={setParamType(index)}>
              {Object.keys(ParamTypes).map((key: string, index) =>
                <option key={key + index} value={key}>{key}</option>)}
            </select>
            <a className="flat-control flat-control--remove" onClick={removeParam(index)}></a>
          </React.Fragment>
        ))}
        <a className="flat-control flat-control--add" onClick={addParam}></a>
        <button className="flat-control flat-control--submit"
          disabled={message && message.type === MessageType.Error}
          onClick={onSubmit(params, onSend, resetParamValues, setMessage)}>
          Send
      </button>
      </div>
      <MessageBox message={message} onExpire={() => setMessage(null)}></MessageBox>
    </Wrapper>
  );
};

enum ParamTypes {
  String = 'String',
  UInt8 = 'UInt8',
  UInt16 = 'UInt16',
  UInt32 = 'UInt32',
  UInt64 = 'UInt64',
  Bytes = 'Bytes'
}
class Param {
  isValid: boolean = true;
  constructor(public type: string = ParamTypes.String, public value: string = '') { }
}

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

const replaceAt = (index: number, value: any, array: any[]) => {
  const newArray = [...array];
  newArray[index] = value;
  return newArray;
};

const onSubmit = (
  params: Param[],
  onSend: () => void,
  resetParamValues: () => void,
  setMessage: React.Dispatch<Message>
) => () => {
  if (params.some(param => !param.value)) {
    setMessage({
      type: MessageType.Error,
      text: 'At least one param has an empty value'
    });
    return;
  }
  onSend();
  resetParamValues();
};

const validateParam = ({ type, value }: Param) => {
  if (!value) {
    return 'Param should not be empty';
  }
  switch (type) {
    case ParamTypes.UInt8:
    case ParamTypes.UInt16:
    case ParamTypes.UInt32:
    case ParamTypes.UInt64:
      return isNaN(parseInt(value)) ? 'Param should be a number' : null;
    default:
      return null;
  }
};

const validate = (param: Param, setMessage: React.Dispatch<Message>) => {
  const errorMessage = validateParam(param);
  if (errorMessage) {
    setMessage({
      type: MessageType.Error,
      text: errorMessage
    });
    param.isValid = false;
  } else {
    setMessage(null);
  }

  return param;
};

const getParamType = (key: string) =>
  Object.keys(ParamTypes).find((paramKey: string) => paramKey === key);

const useParamsHook = (props: ContractFunctionProps) => {
  const [params, setParams] = useState<Param[]>([new Param()]);
  const [message, setMessage] = useState(undefined);

  useEffect(() => {
    try {
      processFunctionParams(props, params);
    } catch (err) {
      setMessage({
        type: MessageType.Error,
        text: err.message
      });
    }
  }, [params]);

  const setParamValue = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const param = params[index];
    let newParam: Param = {
      ...param,
      value: event.target.value,
      isValid: true
    };

    newParam = validate(newParam, setMessage);
    setParams(replaceAt(index, newParam, params));
  };

  const setParamType = (index: number) => (event: ChangeEvent<HTMLSelectElement>) => {
    const param = params[index];
    let newParam: Param = {
      ...param,
      type: getParamType(event.target.value),
      value: '',
      isValid: true
    };
    setMessage(null);
    setParams(replaceAt(index, newParam, params));
  };

  const addParam = () => {
    setParams([...params, new Param()]);
  };

  const removeParam = (index: number) => () => {
    setMessage(null);
    setParams(params.filter((_, i: number) => i !== index));
  };

  const resetParamValues = () => {
    setMessage(null);
    setParams(params.map(param => ({ ...param, value: '' })));
  };

  return { message, setMessage, params, setParamValue, setParamType, addParam, removeParam, resetParamValues };
};

