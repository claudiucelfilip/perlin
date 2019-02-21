export const random = (from: number, to: number): number => Math.floor(Math.random() * to) + from;

export const uniqueRandom = (from: number, to: number) => {
  const cachedResults: any = {};

  return () => {
    let result: number;
    do {
      result = random(from, to);
      if (cachedResults[result] !== true) {
        cachedResults[result] = true;
        return result;
      }
    } while (Object.keys(cachedResults).length < to - from);

    return null;
  }
}
