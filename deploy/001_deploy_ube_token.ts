import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  console.log({ deployer });

  await deployments.deploy('UbeToken', {
    contract: 'UbeToken',
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default func;
func.id = 'deploy_ube_token'; // id required to prevent reexecution
func.tags = ['UbeToken'];
