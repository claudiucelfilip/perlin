import React, { Component } from 'react';
import { PayloadWrapper } from '../store/SmartContractStore';
import styled from 'styled-components';

const Wrapper = styled.div``;
interface PayloadViewerProps {
  payload: PayloadWrapper
}

export const PayloadViewer: React.SFC<PayloadViewerProps> = (props) => {
  const {payload} = props;
  return (
    <Wrapper>
      <pre><code>{JSON.stringify(payload, null, 2)}</code></pre>
    </Wrapper>
  );
};
