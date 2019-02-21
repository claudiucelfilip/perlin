import fp from 'lodash/fp';


export const getFunctionsFromFile = async (file: File) => {
  const result = await readFile(file);
  const exportedFunctions = await getContractFunctions(result);
  return exportedFunctions;

  // setMessage({
  //   type: MessageType.Error,
  //   text: err.message
  // });
  // this.reset();

}

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