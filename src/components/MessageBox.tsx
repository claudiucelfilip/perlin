import React, { useState, ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';


export interface Message {
  type: MessageType;
  text: string;
}

interface MessageBoxProps {
  message?: Message;
}
export enum MessageType {
  Error = 'error',
  Warning = 'warning',
  Success = 'success'
};

const Wrapper = styled.div`
  .message-box--error {
    color: red;
  }
`;


export const MessageBox: React.SFC<MessageBoxProps> = (props: MessageBoxProps) => {
  const { message } = props;

  return (
    <Wrapper>
      {message && <div className={'message-box message-box--' + message.type}>{message.text}</div>}
    </Wrapper>
  );
};
