export const handleInputArray = (
  inputs: string[], 
  target: string, 
  idx: number,
  _number: boolean
  ): string[] => {
  // _number: input element의 타입이 숫자인지 여부
  // 만일 _number가 true일 경우 숫자 외의 값이 들어가지 않게 예외 처리

  const _target = _number
    ? target.length !== 0 
      ? _isOnlyDigits(target) ? target : inputs[idx] 
        // 숫자가 아닌 값이 포함되어있을 경우 업데이트되지 않음.
      : ''
      // 빈 문자열의 경우 min을 0으로 정의
    : target

  const _inputs = idx === 0
    ? [_target].concat(inputs.slice(1))
    : inputs.slice(0, idx).concat(_target).concat(inputs.slice(idx + 1))
  
  return _inputs; // 업데이트된 문자열 배열 반환
}

export const _isOnlyDigits = (str: string) => {
    // Define a regular expression to match only ASCII codes 48 to 57
    const  regex = /^[0-9]+$/;

    // Test the string against the regular expression
    return regex.test(str);
}

export const getInitInputSet = (num: number): string[] => {
  let result: string[] = [];

  for (let i = 0; i < num; i++) {
    result.push('');
  }
  return result;
}

export const _isNumber = (args: string) => {
  if (args === 'uint8' || args === 'uint256')
    return true;
  return false;
}