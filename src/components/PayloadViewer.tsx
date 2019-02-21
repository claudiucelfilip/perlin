import React, { Component } from 'react';
import { SmartContractStore, PayloadWrapper } from '../store/SmartContractStore';

interface PayloadViewerProps {
  payload: PayloadWrapper
};

export const PayloadViewer: React.SFC<PayloadViewerProps> = (props) => {
  return (
    <code>{JSON.stringify(props.payload)}</code>
  );
}