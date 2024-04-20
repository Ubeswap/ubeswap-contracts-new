import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { BigNumber, ethers } from 'ethers';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';
import { AddressStore, UbeToken } from '../typechain';
import exec from '../utils/exec';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer, signerAccount } = await getNamedAccounts();

  await deployments.deploy('AddressStore', {
    contract: 'AddressStore',
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  const addressStoreContract: AddressStore = await hre.ethers.getContract('AddressStore', deployer);

  const ubeToken: UbeToken = await hre.ethers.getContract('UbeToken', deployer);

  const implementationDeployer = await deployments.deterministic('UbeRomulusDelegate', {
    contract: 'RomulusDelegate',
    salt: ethers.utils.solidityKeccak256(['string'], ['UbeRomulusDelegate']),
    from: deployer,
    args: [],
    log: true,
  });

  const proxyDeployer = await deployments.deterministic('UbeRomulusDelegator', {
    contract: 'RomulusDelegator',
    salt: ethers.utils.solidityKeccak256(['string'], ['UbeConvert']),
    from: deployer,
    args: [
      addressStoreContract.address, // address timelock_address_store_,
      ubeToken.address, // address token_,
      ethers.constants.AddressZero, // address releaseToken_,
      implementationDeployer.address, // address implementation_,
      86400, // uint votingPeriod_,  5 days
      720, // uint votingDelay_,  1 hour
      ethers.utils.parseEther('1500000'), // uint proposalThreshold_,  1.5M
    ],
    log: true,
  });

  const timelockDeployer = await deployments.deterministic('UbeGovTimelock', {
    contract: 'Timelock',
    salt: ethers.utils.solidityKeccak256(['string'], ['UbeConvert']),
    from: deployer,
    args: [
      proxyDeployer.address,
      2 * 24 * 60 * 60, // 2 days
    ],
    log: true,
  });

  await exec('set timelock address', addressStoreContract.set(timelockDeployer.address));

  console.log(implementationDeployer.address);
  console.log(proxyDeployer.address);
  console.log(timelockDeployer.address);

  await implementationDeployer.deploy();
  await timelockDeployer.deploy();
  await proxyDeployer.deploy();
};

export default func;
func.id = 'deploy_governance'; // id required to prevent reexecution
func.tags = ['Governance'];
