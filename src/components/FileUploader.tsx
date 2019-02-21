import React, { Component, ChangeEvent, useState } from 'react';
import fp from 'lodash/fp';
import { MessageBox, Message, MessageType } from './MessageBox';
import styled from 'styled-components';

const Wrapper = styled.div`
  text-align: center;

  input[type="file"] {
    display: none;
  }

  .file-upload-zone {
    border: dashed 2px rgba(0,0,0,0.1);
    border-radius: 7px;
    height: 200px;
    display: flex;
    font-weight: bold;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 20px;
    margin: 30px 0;
    transition: all 0.3s ease;
    
    &.dragging {
      border-color: rgba(0,0,0,0.4); 
      
      .file-icon {
        opacity: 0.5;
      }
    }

    .file-icon {
      font-size: 48px;
      display: block;
      margin: 20px 10px 10px;
      opacity: 0.2;
      transition: all 0.3s ease;

      

      &--active {
        opacity: 1;
      }
    }
  }
`;

interface FileUploaderProps {
  onUpload: (file: File) => void;
  onReset: () => void;
  file?: File;
}

export const FileUploader: React.SFC<FileUploaderProps> = (props: FileUploaderProps) => {
  const [message, setMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { onUpload, onReset } = props;
  const file: File | any = props.file || {};

  const inputRef = React.createRef<HTMLInputElement>();
  return (
    <Wrapper>
      <input type="file" ref={inputRef} onChange={onFileUpload(onUpload, setMessage)} />
      <div className={'file-upload-zone ' + (isDragging ? 'dragging' : '')}
        onDragOver={onDragOverHandler(setIsDragging)}
        onDragLeave={onDragLeaveHandler(setIsDragging)}
        onDrop={onDropHandler(setIsDragging, onUpload, setMessage)}>
        <p>
          <i className={'file-icon far fa-file-alt ' + (file.name ? 'file-upload-zone__icon--active' : '')}></i>
          {!file.name ? dropFileSection(inputRef) : removeFileSection(file.name, onReset)}
        </p>
      </div>
      <MessageBox message={message} onExpire={() => setMessage(null)}></MessageBox>
    </Wrapper >
  );
};


const dropFileSection = (inputRef: React.RefObject<HTMLInputElement>) => (
  <React.Fragment>
    Drag .wasm file here or <a href="#" onClick={() => inputRef.current.click()}>Browse</a>
  </React.Fragment>
);

const removeFileSection = (fileName: string, onReset: () => void) => (
  <React.Fragment>
    {fileName} <a href="#" onClick={() => onReset()}>Remove</a>
  </React.Fragment>
);


const onDragLeaveHandler = (setIsDragging: React.Dispatch<boolean>) =>
  (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

const onDragOverHandler = (setIsDragging: React.Dispatch<boolean>) =>
  (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

const onDropHandler = (setIsDragging: React.Dispatch<boolean>, onUpload: React.Dispatch<File>, setMessage: React.Dispatch<Message>) =>
  (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    let files: File[] = [...event.dataTransfer.items]
      .filter((item: DataTransferItem) => item.kind === 'file')
      .map(item => item.getAsFile());

    if (!files.length) {
      files = [...event.dataTransfer.files];
    }
    if (!files.length) {
      setMessage({
        type: MessageType.Error,
        text: 'No file uploaded'
      });
      return;
    }

    setIsDragging(false);
    onUpload(files[0]);
  };

const onFileUpload = (onUpload: React.Dispatch<any>, setMessage: React.Dispatch<Message>) =>
  (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      setMessage({
        type: MessageType.Error,
        text: 'No file uploaded'
      });
      return;
    }
    onUpload(file);

    event.target.value = null;
  };
