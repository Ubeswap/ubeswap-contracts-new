import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, ethers } from 'ethers';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';
import { UbeConvert, UbeToken } from '../typechain';
import exec from '../utils/exec';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer, signerAccount } = await getNamedAccounts();

  console.log({ deployer, signerAccount });

  const ubeOldAddress = '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC';
  const ubeNewAddress = (await hre.deployments.get('UbeToken')).address;

  await deployments.deploy('UbeConvert', {
    contract: 'UbeConvert',
    from: deployer,
    args: [
      ubeNewAddress, // address _newUbe,
      ubeOldAddress, // address _oldUbe,
      0, // uint256 _startDate,
      ethers.constants.MaxUint256, // uint256 _endDate,
      150, // uint256 _exchangeRate
    ],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  const ubeConvert: UbeConvert = await hre.ethers.getContract('UbeConvert', deployer);
  const ube: UbeToken = await hre.ethers.getContract('UbeToken', deployer);

  await exec('Transfer', ube.transfer(ubeConvert.address, eth('75_000_000')));

  await exec(
    'WHITELISTER_ROLE',
    ubeConvert.grantRole(await ubeConvert.WHITELISTER_ROLE(), signerAccount)
  );
};

function eth(input: string | number) {
  if (typeof input == 'string') {
    input = input.replace(/_/g, '');
  }
  return ethers.utils.parseEther(input + '');
}

export default func;
/*func.skip = async (hre: HardhatRuntimeEnvironment) => {
  const chainId = parseInt(await hre.getChainId());
  return [31337, 97, 44787].includes(chainId) == false;
};*/
func.id = 'deploy_ube_convert'; // id required to prevent reexecution
func.tags = ['UbeConvert'];
