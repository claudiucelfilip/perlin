import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div<{ position: { x: number, y: number } }>`
  .popup {
    position: fixed;
    left: ${(props: any) => props.position.x + 10}px;
    top: ${(props: any) => props.position.y + 10}px;
    min-width: 120px;
    min-height: 70px;
    padding: 10px;
    background: #fff;
    font-size: 10px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.1s ease;
    transform: translateZ(-100px);
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    transform-origin: 50% 0;
    

    &.active {
      opacity: 1;
      transform: translateZ(0);
    }
  }  
`;

export interface NodePopupProps {
  position: { x: number, y: number };
  info?: any;
  active: boolean;
}
export const NodePopup: React.SFC<NodePopupProps> = (props) => {
  const { position, active } = props;
  const info = props.info || {};

  return (
    <Wrapper position={position}>
      <pre className={'popup ' + (active ? 'active' : '')}>
        {JSON.stringify(info).replace(/([\{,]|.(?=\}))/g, '$1\n')}
      </pre>
    </Wrapper>
  )
}

