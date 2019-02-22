import React, { useState, ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  .message-box {
    color: rgba(255,255,255,0.8);
    padding: 5px 10px;
    font-size: 14px;
    border-radius: 4px;
  }
  .message-box--error {
    background: #bd1d50;
  }
  .message-box--success {
    background: #739802;
  }
`;

export interface Message {
  type: MessageType;
  text: string;
}

interface MessageBoxProps {
  message?: Message;
  onExpire?: () => void;
  duration?: number;
}
export enum MessageType {
  Error = 'error',
  Warning = 'warning',
  Success = 'success'
};

let timeout: number;
export const MessageBox: React.SFC<MessageBoxProps> = (props: MessageBoxProps) => {
  const { message, onExpire, duration } = props;

  useEffect(() => {
    if (onExpire) {
      timeout = setTimeout(onExpire, duration || 5000);
    }
    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <Wrapper>
      {message && <div className={'message-box message-box--' + message.type}>{message.text}</div>}
    </Wrapper>
  );
};
