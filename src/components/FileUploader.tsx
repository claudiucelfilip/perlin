import React, { Component, ChangeEvent, useState } from 'react';
import fp from 'lodash/fp';
import { MessageBox, Message, MessageType } from './MessageBox';

interface FileUploaderProps {
  onUpload: (fns: string[]) => void;
  onReset: () => void;
}

export const FileUploader: React.SFC<FileUploaderProps> = (props: FileUploaderProps) => {
  const [message, setMessage] = useState(null);
  return (
    <div>
      <input type="file" onChange={onFilteUpload(props, setMessage)} />
      <MessageBox message={message}></MessageBox>
    </div>
  );
}

const onFilteUpload = (props: FileUploaderProps, setMessage: React.Dispatch<Message>) =>
  async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    try {
      if (!file) {
        throw new Error('No files uploaded');
      }

      const result = await readFile(file);
      const exportedFunctions = await getContractFunctions(result);
      props.onUpload(exportedFunctions);
    } catch (err) {
      setMessage({
        type: MessageType.Error,
        text: err.message
      });
      props.onReset();
    }
  };

const readFile = (uploadedFile: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = () => {
      reader.abort();
      reject(new Error('Couldn\'t process uploaded file'));
    };

    reader.readAsArrayBuffer(uploadedFile);
  });

const getContractFunctions = async (bytes: ArrayBuffer) =>
  await WebAssembly.instantiate(bytes, {
    env: {
      _payload_len: () => 0,
      _payload: () => 0,
      _provide_result: () => 0,
      _send_transaction: () => 0,
      _log: console.log
    }
  }).then(parseContract('_contract_'));

const getByPrefix = (contractPrefix: string) => (exp: any) => exp.startsWith(contractPrefix);
const stripPrefix = (contractPrefix: string) => (exp: any) => exp.replace(contractPrefix, '');

const parseContract = (contractPrefix: string) => fp.compose(
  fp.map(stripPrefix(contractPrefix)),
  fp.filter(getByPrefix(contractPrefix)),
  fp.keys,
  fp.get('instance.exports')
);