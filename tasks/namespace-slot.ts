import * as fs from "fs";
import * as path from "path";

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

interface ERC7201NamespaceInfo {
  file: string;
  namespace: string;
  value: string;
}

task("namespace-slot", "check solidity files namespace slot value(ERC7201)")
  .setAction(async (
    taskArgs: TaskArguments,
    hre: HardhatRuntimeEnvironment
  ) => {
    const contractsDir = hre.config.paths.sources;
    const ERC7201NamespaceInfo = findERC7201NamespaceInfo(contractsDir);
    ERC7201NamespaceInfo.forEach(data => {
      const calcSlot = "0x"+namespaceSlot(data.namespace, hre);
      if(calcSlot !== data.value) {
        console.log(`File: ${data.file}\nNamespace: ${data.namespace}, Value: ${data.value}, Should: ${calcSlot}`);
      }
    });
  });

function findERC7201NamespaceInfo(contractsDir: string) {
  const results: ERC7201NamespaceInfo[] = [];
  walkDir(contractsDir, filePath => {
    if (filePath.endsWith(".sol")) {
      const data = extractData(filePath);
      if (data) results.push(data);
    }
  });
  return results;
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Solidity 파일 내용에서 필요한 데이터 추출
function extractData(filePath: string): ERC7201NamespaceInfo | null {
  const content = fs.readFileSync(filePath, "utf8");
  const regex = /bytes32 private constant (\w+StorageLocation) =\s+([^;]+);/g;
  const match = regex.exec(content);

  if (match) {
    // 네임스페이스 추출을 위한 정규 표현식 수정
    const namespaceRegex = /keccak256\(abi\.encode\(uint256\(keccak256\("([^"]+)"\)\) - 1\)\)/;
    const namespaceMatch = namespaceRegex.exec(content);
    return {
      file: filePath,
      namespace: namespaceMatch ? namespaceMatch[1] : "",
      value: match[2]
    };
  } else {
    return null;
  }
}

export function namespaceSlot(namespace: string, hre:HardhatRuntimeEnvironment) {
  // keccak256(abi.encode(uint256(keccak256(namespace)) - 1)) & ~bytes32(uint256(0xff))
  const hashNamespace = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(namespace));

  const number = hre.ethers.toBigInt(hashNamespace) - 1n;

  const hash_second = hre.ethers.keccak256(hre.ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [number]));

  const finalMasked = (hre.ethers.toBigInt(hash_second) & (hre.ethers.MaxUint256 - 255n)).toString(16);

  return finalMasked;
}