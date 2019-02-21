import React, { useState, ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';
import { ContractFunction } from './ContractFunction';
import { Payload } from '../store/SmartContractStore';

const Wrapper = styled.div`
  display: flex;
  .message-box--error {
    color: red;
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
      {
        <select onChange={(event) => setSelectedFunction(event.target.value)}>
          {props.functions.map((fn: string, index: number) => <option key={fn} value={fn}>{fn}</option>)}
        </select>
      }
      {props.functions
        .filter((fn: string) => fn === selectedFunction)
        .map((fn: string, index: number) =>
          <ContractFunction onChange={props.onChange} onSend={props.onSend} key={fn + index} name={fn} />)}
    </Wrapper>
  );
};
