import React, { useState, ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';
import { ContractFunction } from './ContractFunction';
import { Payload } from '../store/SmartContractStore';

const Wrapper = styled.div`
  .function-select {
    flex-grow: 1;
    background-color: #fefbaf;
  }

  .label-text {
    margin-bottom: 10px;
  }
`;

interface FunctionSelectorProps {
  onChange: (payload: Payload) => void;
  onSend: () => void;
  functions: string[];
}

export const FunctionSelector: React.SFC<FunctionSelectorProps> = (props: FunctionSelectorProps) => {
  const [selectedFunction, setSelectedFunction] = useState(props.functions[0]);

  return (
    <Wrapper>
      <div className="module label-text">
        Select a function and set its parameters
      </div>
      <div className="flat-control-row">
        {
          <select className="flat-control function-select" onChange={(event) => setSelectedFunction(event.target.value)}>
            {props.functions.map((fn: string, index: number) => <option key={fn + index} value={fn}>{fn}</option>)}
          </select>
        }
        {props.functions
          .filter((fn: string) => fn === selectedFunction)
          .map((fn: string, index: number) =>
            <ContractFunction onChange={props.onChange} onSend={props.onSend} key={fn + index} name={fn} />)}
      </div>
    </Wrapper>
  );
};
