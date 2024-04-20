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

  const ubeAddress = (await hre.deployments.get('UbeToken')).address;
  const romulusDelegatorAddress = (await hre.deployments.get('UbeRomulusDelegator')).address;
  const DaoMultisig = '0x5ADBd44Ab2d173D45C829D9F83148D4E4Dd552CE';

  await deployments.deploy('VotableStakingRewards', {
    contract: 'VotableStakingRewards',
    from: deployer,
    args: [
      deployer, // address _owner,
      DaoMultisig, // address _rewardsDistribution,
      ubeAddress, // address _rewardsToken,
      ubeAddress, // address _stakingToken,
      romulusDelegatorAddress, // IRomulusDelegate _romulusDelegate
    ],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
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
func.id = 'deploy_ube_stake'; // id required to prevent reexecution
func.tags = ['UbeStake'];
